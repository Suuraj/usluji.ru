package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
	"usluji/internal/database"
	"usluji/internal/handlers"
	"usluji/internal/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	database.Init()
	defer database.DB.Close()

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"https://usluji.ru"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Authorization", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	api := r.Group("/api")
	{
		api.POST("/auth", handlers.AuthHandler)
		api.GET("/orders", handlers.GetOrders)
		api.GET("/profiles", handlers.GetProfiles)

		auth := api.Group("/")
		auth.Use(middleware.AuthRequired())
		{
			auth.POST("/orders", handlers.CreateOrder)
			auth.GET("/orders/:id", handlers.GetOrder)
			auth.POST("/orders/:id/respond", handlers.RespondToOrder)
			auth.GET("/orders/:id/responses", handlers.GetOrderResponses)

			auth.PUT("/profile", handlers.UpdateProfile)
			auth.GET("/profiles/:id", handlers.GetProfile)
			auth.POST("/profiles/:id/offer", handlers.OfferToUser)

			auth.GET("/my/offers", handlers.GetMyOffers)
			auth.GET("/my/responses", handlers.GetMyResponses)
			auth.PATCH("/responses/:id/status", handlers.UpdateResponseStatus)
		}
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	srv := &http.Server{
		Addr:    ":" + port,
		Handler: r,
	}

	go func() {
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("Listen: %s\n", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server Shutdown:", err)
	}
}
