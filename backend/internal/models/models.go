package models

import "time"

type GeoPoint struct {
	Lat *float64 `json:"lat"`
	Lng *float64 `json:"lng"`
}

type User struct {
	ID          string    `json:"id"`
	TgID        int64     `json:"tg_id,omitempty"`
	Name        string    `json:"name"`
	Role        *string   `json:"role,omitempty"`
	Description *string   `json:"description,omitempty"`
	TgUsername  *string   `json:"tg_username,omitempty"`
	PhotoUrl    *string   `json:"photo_url,omitempty"`
	Address     *string   `json:"address,omitempty"`
	Location    *GeoPoint `json:"location,omitempty"`
	Distance    *float64  `json:"distance,omitempty"`
	Rating      *float64  `json:"rating,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
}

type Order struct {
	ID          string    `json:"id"`
	UserID      string    `json:"user_id"`
	UserName    string    `json:"user_name,omitempty"`
	UserRating  *float64  `json:"user_rating,omitempty"`
	TgUsername  *string   `json:"tg_username,omitempty"`
	PhotoUrl    *string   `json:"photo_url,omitempty"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Price       *int64    `json:"price"`
	Address     *string   `json:"address,omitempty"`
	Location    *GeoPoint `json:"location,omitempty"`
	Distance    *float64  `json:"distance,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
}

type Response struct {
	ID         string    `json:"id"`
	OrderID    string    `json:"order_id"`
	OrderTitle string    `json:"order_title,omitempty"`
	UserID     string    `json:"user_id"`
	UserName   string    `json:"user_name,omitempty"`
	UserRating *float64  `json:"user_rating,omitempty"`
	TgUsername *string   `json:"tg_username,omitempty"`
	PhotoUrl   *string   `json:"photo_url,omitempty"`
	Type       string    `json:"type"`   // 'apply' или 'offer'
	Status     string    `json:"status"` // 'pending', 'accepted', 'rejected'
	CreatedAt  time.Time `json:"created_at"`
}
