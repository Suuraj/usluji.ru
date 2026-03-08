package handlers

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"net/http"
	"os"
	"sort"
	"strings"
	"time"
	"usluji/internal/auth"
	"usluji/internal/database"

	"github.com/gin-gonic/gin"
)

type TelegramAuth struct {
	ID        int64  `json:"id" binding:"required"`
	AuthDate  int64  `json:"auth_date" binding:"required"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Username  string `json:"username"`
	PhotoUrl  string `json:"photo_url"`
	Hash      string `json:"hash" binding:"required"`
}

func AuthHandler(c *gin.Context) {
	var data TelegramAuth
	if err := c.ShouldBindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid auth data"})
		return
	}

	if !validateTelegramHash(data) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Security hash mismatch"})
		return
	}

	fullName := strings.TrimSpace(data.FirstName + " " + data.LastName)
	var userID string

	query := `
		INSERT INTO users (tg_id, name, tg_username, photo_url)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (tg_id) DO UPDATE SET
			tg_username = EXCLUDED.tg_username,
			photo_url = EXCLUDED.photo_url
		RETURNING id`

	err := database.DB.QueryRow(c.Request.Context(), query, data.ID, fullName, data.Username, data.PhotoUrl).Scan(&userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database sync failed"})
		return
	}

	token, err := auth.GenerateToken(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Token generation failed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"token": token, "user_id": userID})
}

func validateTelegramHash(data TelegramAuth) bool {
	botToken := os.Getenv("BOT_TOKEN")
	if botToken == "" {
		return false
	}

	if time.Now().Unix()-data.AuthDate > 86400 {
		return false
	}

	params := map[string]string{
		"id":         fmt.Sprintf("%d", data.ID),
		"auth_date":  fmt.Sprintf("%d", data.AuthDate),
		"first_name": data.FirstName,
		"last_name":  data.LastName,
		"username":   data.Username,
		"photo_url":  data.PhotoUrl,
	}

	var keys []string
	for k, v := range params {
		if v != "" {
			keys = append(keys, k+"="+v)
		}
	}
	sort.Strings(keys)
	dataCheckString := strings.Join(keys, "\n")

	sha := sha256.New()
	sha.Write([]byte(botToken))
	secretKey := sha.Sum(nil)

	h := hmac.New(sha256.New, secretKey)
	h.Write([]byte(dataCheckString))

	return hex.EncodeToString(h.Sum(nil)) == data.Hash
}
