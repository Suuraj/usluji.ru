FROM golang:alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY . .

RUN CGO_ENABLED=0 go build -o usluji-api ./cmd/api

FROM alpine:latest

WORKDIR /root/

COPY --from=builder /app/usluji-api .

EXPOSE 8080

CMD ["./usluji-api"]
