package main

import "net/http"

type corsConfig struct {
	AllowedOrigins   []string
	AllowedMethods   string
	AllowedHeaders   string
	AllowCredentials bool
}

func (app *application) server() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("/", app.Home)
	mux.HandleFunc("/register", app.RegisterHandler)
	mux.HandleFunc("/login", app.LoginHandler)
	mux.HandleFunc("/check-auth", app.AuthHandler)
	mux.HandleFunc("/logout", app.LogOutHandler)
	mux.HandleFunc("/get-posts", app.GetPostsHandler)
	mux.HandleFunc("/get-single-post", app.GetSinglePostHandler)
	mux.HandleFunc("/get-groups", app.GetGroupsHandler)
	mux.HandleFunc("/get-user-posts", app.GetUserPostsHandler)
	mux.HandleFunc("/poster", app.CreatePostHandler)
	mux.HandleFunc("/get-user-data", app.GetUserInfoHandler)
	mux.HandleFunc("/follow", app.CreateFollowHandler)
	mux.HandleFunc("/followers", app.FollowersHandler)
	mux.HandleFunc("/get-follow-requests", app.GetFollowRequestsHandler)
	mux.HandleFunc("/handle-follow-request", app.FollowRequestHandler)
	mux.HandleFunc("/post-like", app.LikeHandler)
	mux.HandleFunc("/get-post-likes", app.GetPostLikesHandler)
	mux.HandleFunc("/get-chat-data", app.GetChatDataHandler)
	mux.HandleFunc("/create-comment", app.CreateCommentHandler)
	mux.HandleFunc("/get-comments", app.GetCommentsHandler)
	mux.HandleFunc("/get-comment-likes", app.GetCommentLikesHandler)
	mux.HandleFunc("/create-group", app.CreateGroupHandler)
	mux.HandleFunc("/get-group-data", app.GetGroupDataHandler)
	mux.HandleFunc("/get-invitable-users", app.GetInvitableUsersHandler)
	mux.HandleFunc("/get-group-posts", app.GetGroupPostsHandler)
	mux.HandleFunc("/get-group-invites", app.GetGroupInvitesHandler)
	mux.HandleFunc("/get-group-join-requests", app.GetGroupJoinRequestsHandler)
	mux.HandleFunc("/get-group-chat-data", app.GetGroupChatDataHandler)
	mux.HandleFunc("/get-all-groups", app.GetAllGroupsHandler)
	mux.HandleFunc("/create-event", app.CreateEventHandler)
	mux.HandleFunc("/get-events", app.GetEventsHandler)
	mux.HandleFunc("/update-attendance", app.UpdateAttendanceHandler)
	mux.HandleFunc("/handle-group-join-request", app.GroupJoinRequestHandler)
	mux.HandleFunc("/handle-group-invite", app.GroupInviteHandler)
	mux.HandleFunc("/invite-user", app.InviteUserHandler)
	mux.HandleFunc("/send-join-request", app.SendJoinRequestHandler)
	mux.HandleFunc("/set-privacy", app.PrivacyHandler)
	mux.HandleFunc("/search", app.SearchHandler)
	mux.HandleFunc("/add-notification", app.AddNotificationHandler)
	mux.HandleFunc("/set-notifications-to-seen", app.SetAllNotificationsToSeenHandler)
	mux.HandleFunc("/update-notification-status", app.UpdateNOtificationStatusHandler)
	mux.HandleFunc("/ws", NewManager().ServeWS)
	mux.HandleFunc("/get-image/", func(w http.ResponseWriter, r *http.Request) {
		http.StripPrefix("/get-image/", http.FileServer(http.Dir("backend/media"))).ServeHTTP(w, r)
	})

	return app.handleCORS(mux)
}

func (app *application) handleCORS(h http.Handler) http.Handler {
	config := corsConfig{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowedMethods:   "GET,POST,PUT,PATCH,DELETE,OPTIONS",
		AllowedHeaders:   "Accept, Content-Type, X-CSRF-Token, Authorization",
		AllowCredentials: true,
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		for _, allowedOrigin := range config.AllowedOrigins {
			if allowedOrigin == origin {
				w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
				break
			}
		}

		if r.Method == "OPTIONS" {
			w.Header().Set("Access-Control-Allow-Methods", config.AllowedMethods)
			w.Header().Set("Access-Control-Allow-Headers", config.AllowedHeaders)
			w.Header().Set("Access-Control-Allow-Credentials", "true")
			return
		}

		h.ServeHTTP(w, r)
	})
}
