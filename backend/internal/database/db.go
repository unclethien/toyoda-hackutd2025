package database

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

var Pool *pgxpool.Pool

// InitDB initializes the database connection pool
func InitDB(connectionString string) error {
	ctx := context.Background()

	// Configure connection pool
	config, err := pgxpool.ParseConfig(connectionString)
	if err != nil {
		return fmt.Errorf("failed to parse connection string: %w", err)
	}

	// Set pool configuration
	config.MaxConns = 25
	config.MinConns = 5
	config.MaxConnLifetime = 5 * time.Minute
	config.MaxConnIdleTime = 30 * time.Second
	config.HealthCheckPeriod = 1 * time.Minute

	// Create connection pool
	Pool, err = pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		return fmt.Errorf("failed to create connection pool: %w", err)
	}

	// Test connection
	if err = Pool.Ping(ctx); err != nil {
		return fmt.Errorf("failed to ping database: %w", err)
	}

	log.Println("✅ Database connection established")
	log.Println("📋 Using existing Supabase schema (no table creation needed)")

	return nil
}

// CloseDB closes the database connection pool
func CloseDB() {
	if Pool != nil {
		Pool.Close()
	}
}
