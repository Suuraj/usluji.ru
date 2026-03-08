package handlers

import (
	"net/http"
	"usluji/internal/database"
	"usluji/internal/models"

	"github.com/gin-gonic/gin"
)

func RespondToOrder(c *gin.Context) {
	userID := c.MustGet("userID").(string)
	orderID := c.Param("id")

	query := `
		INSERT INTO responses (order_id, user_id, type)
		VALUES ($1, $2, 'apply')
		ON CONFLICT (order_id, user_id) DO NOTHING`

	_, err := database.DB.Exec(c.Request.Context(), query, orderID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to respond"})
		return
	}

	c.Status(http.StatusCreated)
}

func OfferToUser(c *gin.Context) {
	userID := c.MustGet("userID").(string)
	toUserID := c.Param("id")

	var req struct {
		OrderID string `json:"order_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Order ID required"})
		return
	}

	query := `SELECT EXISTS(SELECT 1 FROM orders WHERE id = $1 AND user_id = $2)`

	var exists bool
	err := database.DB.QueryRow(c.Request.Context(), query, req.OrderID, userID).Scan(&exists)
	if err != nil || !exists {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	query = `
		INSERT INTO responses (order_id, user_id, type)
		VALUES ($1, $2, 'offer')
		ON CONFLICT (order_id, user_id) DO NOTHING`

	_, err = database.DB.Exec(c.Request.Context(), query, req.OrderID, toUserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to offer"})
		return
	}

	c.Status(http.StatusCreated)
}

func GetMyOffers(c *gin.Context) {
	userID := c.MustGet("userID").(string)

	query := `
		SELECT
			r.id, r.order_id, o.title, o.user_id, u.name, u.rating, u.photo_url,
			u.tg_username, r.status, r.created_at
		FROM responses r
		JOIN orders o ON r.order_id = o.id
		JOIN users u ON o.user_id = u.id
		WHERE r.user_id = $1 AND r.type = 'offer'
		ORDER BY r.created_at DESC`

	fetchResponses(c, query, userID)
}

func GetOrderResponses(c *gin.Context) {
	userID := c.MustGet("userID").(string)
	orderID := c.Param("id")

	query := `
		SELECT
			r.id, r.order_id, o.title, r.user_id, u.name, u.rating, u.photo_url,
			u.tg_username, r.status, r.created_at
		FROM responses r
		JOIN orders o ON r.order_id = o.id
		JOIN users u ON r.user_id = u.id
		WHERE o.user_id = $1 AND r.order_id = $2 AND r.type = 'apply'
		ORDER BY r.created_at DESC`

	fetchResponses(c, query, userID, orderID)
}

func GetMyResponses(c *gin.Context) {
	userID := c.MustGet("userID").(string)

	query := `
		SELECT
			r.id, r.order_id, o.title, o.user_id, u.name, u.rating, u.photo_url,
			CASE WHEN r.status = 'accepted' THEN u.tg_username END,
			r.status, r.created_at
		FROM responses r
		JOIN orders o ON r.order_id = o.id
		JOIN users u ON o.user_id = u.id
		WHERE r.user_id = $1 AND r.type = 'apply'
		ORDER BY r.created_at DESC`

	fetchResponses(c, query, userID)
}

func UpdateResponseStatus(c *gin.Context) {
	userID := c.MustGet("userID").(string)
	respID := c.Param("id")

	var req struct {
		Status string `json:"status" binding:"required,oneof=accepted rejected"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid status"})
		return
	}

	query := `
		UPDATE responses r
		SET status = $1
		FROM orders o
		WHERE r.id = $2 AND r.order_id = o.id AND o.user_id = $3`

	_, err := database.DB.Exec(c.Request.Context(), query, req.Status, respID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Update failed"})
		return
	}

	c.Status(http.StatusOK)
}

func fetchResponses(c *gin.Context, query string, args ...any) {
	rows, err := database.DB.Query(c.Request.Context(), query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Query failed"})
		return
	}
	defer rows.Close()

	var responses []models.Response
	for rows.Next() {
		var r models.Response
		err := rows.Scan(
			&r.ID, &r.OrderID, &r.OrderTitle, &r.UserID, &r.UserName,
			&r.UserRating, &r.PhotoUrl, &r.TgUsername, &r.Status, &r.CreatedAt,
		)
		if err == nil {
			responses = append(responses, r)
		}
	}

	c.JSON(http.StatusOK, responses)
}
