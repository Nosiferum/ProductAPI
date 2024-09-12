#!/bin/sh

echo "Starting the seeding process..."
if npm run seed; then
    echo "Seeding completed successfully. Starting the API server..."
    npm start
else
    echo "Seeding failed. Exiting..."
    exit 1
fi