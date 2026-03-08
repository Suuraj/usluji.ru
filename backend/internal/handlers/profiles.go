package handlers

import (
	"net/http"
	"strconv"
	"usluji/internal/database"
	"usluji/internal/models"

	"github.com/gin-gonic/gin"
)

func GetProfile(c *gin.Context) {
	userID := c.MustGet("userID").(string)
	profileID := c.Param("id")
	skipOrders := c.Query("hide_orders") == "true"

	queryUser := `
		SELECT id, name, role, description, photo_url, address, rating, created_at,
		       ST_Y(location::geometry), ST_X(location::geometry),
			   CASE
				 WHEN id = $1 THEN tg_username
				 WHEN EXISTS (
					 SELECT 1 FROM responses r
					 JOIN orders o ON r.order_id = o.id
					 WHERE ((r.user_id = $2 AND o.user_id = $1) OR (r.user_id = $1 AND o.user_id = $2))
					 AND r.status = 'accepted'
				 ) THEN tg_username
			   END
		FROM users WHERE id = $2`

	var u models.User
	var lat, lng *float64
	err := database.DB.QueryRow(c.Request.Context(), queryUser, userID, profileID).Scan(
		&u.ID, &u.Name, &u.Role, &u.Description, &u.PhotoUrl, &u.Address, &u.Rating, &u.CreatedAt,
		&lat, &lng, &u.TgUsername,
	)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if lat != nil && lng != nil {
		u.Location = &models.GeoPoint{Lat: lat, Lng: lng}
	}

	var orders []models.Order
	if !skipOrders {
		queryOrders := `
			SELECT id, title, price, created_at
			FROM orders WHERE user_id = $1
			ORDER BY created_at DESC LIMIT 50`

		rows, _ := database.DB.Query(c.Request.Context(), queryOrders, profileID)
		defer rows.Close()

		for rows.Next() {
			var o models.Order
			if err := rows.Scan(&o.ID, &o.Title, &o.Price, &o.CreatedAt); err == nil {
				orders = append(orders, o)
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{"profile": u, "orders": orders})
}

func GetProfiles(c *gin.Context) {
	lat, _ := strconv.ParseFloat(c.DefaultQuery("lat", "55.75"), 64)
	lng, _ := strconv.ParseFloat(c.DefaultQuery("lng", "37.61"), 64)
	radius, _ := strconv.ParseFloat(c.DefaultQuery("radius", "50000"), 64)
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit := 20
	offset := (page - 1) * limit

	query := `
		SELECT
			id, name, role, description, photo_url, address, rating,
			ST_Y(location::geometry), ST_X(location::geometry),
			ST_Distance(location, ST_MakePoint($1, $2)::geography)
		FROM users
		WHERE location IS NULL OR ST_DWithin(location, ST_MakePoint($1, $2)::geography, $3)
		ORDER BY rating DESC NULLS LAST, created_at DESC
		LIMIT $4 OFFSET $5`

	rows, err := database.DB.Query(c.Request.Context(), query, lng, lat, radius, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch profiles"})
		return
	}
	defer rows.Close()

	var profiles []models.User
	for rows.Next() {
		var u models.User
		var lt, lg *float64
		if err := rows.Scan(&u.ID, &u.Name, &u.Role, &u.Description, &u.PhotoUrl, &u.Address, &u.Rating, &lt, &lg, &u.Distance); err == nil {
			if lt != nil && lg != nil {
				u.Location = &models.GeoPoint{Lat: lt, Lng: lg}
			}
			profiles = append(profiles, u)
		}
	}

	c.JSON(http.StatusOK, profiles)
}

func UpdateProfile(c *gin.Context) {
	userID := c.MustGet("userID").(string)

	var req struct {
		Name        string   `json:"name" binding:"required,max=100"`
		Role        *string  `json:"role" binding:"omitempty,max=100"`
		Description *string  `json:"description" binding:"omitempty,max=3000"`
		Address     *string  `json:"address" binding:"omitempty,max=200"`
		Lat         *float64 `json:"lat"`
		Lng         *float64 `json:"lng"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid profile data"})
		return
	}

	query := `
		UPDATE users
		SET name = $1, role = $2, description = $3, address = $4,
		    location = CASE WHEN $5::float8 IS NOT NULL AND $6::float8 IS NOT NULL
                       THEN ST_SetSRID(ST_MakePoint($5, $6), 4326)::geography END
		WHERE id = $7`

	_, err := database.DB.Exec(c.Request.Context(), query, req.Name, req.Role, req.Description, req.Address, req.Lng, req.Lat, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Update failed"})
		return
	}

	c.Status(http.StatusOK)
}
