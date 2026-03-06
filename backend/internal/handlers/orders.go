package handlers

import (
	"net/http"
	"strconv"
	"usluji/internal/database"
	"usluji/internal/models"

	"github.com/gin-gonic/gin"
)

func CreateOrder(c *gin.Context) {
	userID := c.MustGet("userID").(string)

	var req struct {
		Title       string   `json:"title" binding:"required,max=100"`
		Description string   `json:"description" binding:"required,max=3000"`
		Price       int64    `json:"price"`
		Address     *string  `json:"address" binding:"omitempty,max=200"`
		Lat         *float64 `json:"lat"`
		Lng         *float64 `json:"lng"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid order data"})
		return
	}

	var orderID string
	query := `
		INSERT INTO orders (user_id, title, description, price, address, location)
		VALUES ($1, $2, $3, $4, $5,
			CASE WHEN $6::float8 IS NOT NULL AND $7::float8 IS NOT NULL
			THEN ST_SetSRID(ST_MakePoint($6, $7), 4326)::geography END)
		RETURNING id`

	err := database.DB.QueryRow(c.Request.Context(), query, userID, req.Title, req.Description, req.Price, req.Address, req.Lng, req.Lat).Scan(&orderID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save order"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"id": orderID})
}

func GetOrder(c *gin.Context) {
	userID := c.MustGet("userID").(string)
	orderID := c.Param("id")

	query := `
		SELECT
			o.id, o.user_id, u.name, u.rating, u.photo_url, o.title, o.description, o.price, o.address,
			ST_Y(o.location::geometry), ST_X(o.location::geometry), o.created_at,
			CASE
				WHEN o.user_id = $1 OR EXISTS (
					SELECT 1 FROM responses r
					WHERE r.order_id = o.id AND r.user_id = $1 AND r.status = 'accepted'
				) THEN u.tg_username
			END
		FROM orders o
		JOIN users u ON o.user_id = u.id
		WHERE o.id = $2`

	var o models.Order
	var lat, lng *float64

	err := database.DB.QueryRow(c.Request.Context(), query, userID, orderID).Scan(
		&o.ID, &o.UserID, &o.UserName, &o.UserRating, &o.PhotoUrl, &o.Title, &o.Description, &o.Price, &o.Address,
		&lat, &lng, &o.CreatedAt, &o.TgUsername,
	)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
		return
	}

	if lat != nil && lng != nil {
		o.Location = &models.GeoPoint{Lat: lat, Lng: lng}
	}
	c.JSON(http.StatusOK, o)
}

func GetOrders(c *gin.Context) {
	lat, _ := strconv.ParseFloat(c.DefaultQuery("lat", "55.75"), 64)
	lng, _ := strconv.ParseFloat(c.DefaultQuery("lng", "37.61"), 64)
	radius, _ := strconv.ParseFloat(c.DefaultQuery("radius", "50000"), 64)
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))

	limit := 20
	offset := (page - 1) * limit

	query := `
		SELECT
			o.id, o.user_id, u.name, u.rating, u.photo_url, o.title, o.description, o.price, o.address,
			ST_Y(o.location::geometry), ST_X(o.location::geometry), o.created_at,
			ST_Distance(o.location, ST_MakePoint($1, $2)::geography)
		FROM orders o
		JOIN users u ON o.user_id = u.id
		WHERE o.location IS NULL OR ST_DWithin(o.location, ST_MakePoint($1, $2)::geography, $3)
		ORDER BY o.created_at DESC
		LIMIT $4 OFFSET $5`

	rows, err := database.DB.Query(c.Request.Context(), query, lng, lat, radius, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch orders"})
		return
	}
	defer rows.Close()

	var orders []models.Order
	for rows.Next() {
		var o models.Order
		var lt, lg *float64
		if err := rows.Scan(
			&o.ID, &o.UserID, &o.UserName, &o.UserRating, &o.PhotoUrl, &o.Title, &o.Description, &o.Price, &o.Address,
			&lt, &lg, &o.CreatedAt, &o.Distance,
		); err == nil {
			if lt != nil && lg != nil {
				o.Location = &models.GeoPoint{Lat: lt, Lng: lg}
			}
			orders = append(orders, o)
		}
	}

	c.JSON(http.StatusOK, orders)
}
