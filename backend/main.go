package main

import (
	"context"
	"fmt"
	"main/handlers"
	"net/http"
)

func main() {
	port := 8080
	http.HandleFunc("/login", handlers.LoginHandler)
	http.HandleFunc("/comments", handlers.CommentsHandler)
	http.HandleFunc("/logout", handlers.LogoutHandler)
	http.HandleFunc("/register", handlers.RegisterHandler)
	http.HandleFunc("/post", handlers.PostHandler)
	http.HandleFunc("/getPostsByGroupId", handlers.PostsByGroupIdHandler)
	http.HandleFunc("/feed", handlers.FeedHandler)
	http.HandleFunc("/group", handlers.GroupHandler)
	http.HandleFunc("/groupMembers", handlers.GroupMembersHandler)
	http.HandleFunc("/allGroups", handlers.AllGroupsHandler)
	http.HandleFunc("/getGroupRelations", handlers.GetGroupRelationsByUserId)
	http.HandleFunc("/groupInvites", handlers.InvitesHandler)
	http.HandleFunc("/groupInvite", handlers.GroupInviteHandler)
	http.HandleFunc("/groupRequests", handlers.GroupRequestsHandler)
	http.HandleFunc("/eventInvite", handlers.EventInviteHandler)
	http.HandleFunc("/event", handlers.EventHandler)
	http.HandleFunc("/allEvents", handlers.AllEventsHandler)
	http.HandleFunc("/eventRelationships", handlers.EventRelationships)
	http.HandleFunc("/posts", handlers.PostsHandler)
	http.HandleFunc("/authedProfile", handlers.AuthedProfileHandler)
	http.HandleFunc("/profile", handlers.ProfileHandler)
	http.HandleFunc("/setProfilePrivacy", handlers.ProfilePrivacyHandler)
	http.HandleFunc("/relationshipRequest", handlers.FollowRequestHandler)
	http.HandleFunc("/relationship", handlers.FollowHandler)
	http.HandleFunc("/allUsers", handlers.GetAllUsersHandler)
	http.HandleFunc("/allConversations", handlers.GetAllConversations)
	http.HandleFunc("/conversations", handlers.ConversationHandler)
	http.HandleFunc("/messages", handlers.MessagesHandler)
	http.HandleFunc("/getConversationRelationship", handlers.ConversationRelationshipHandler)
	http.HandleFunc("/websocketAuthentication", handlers.WebsocketAuthentication)
	http.HandleFunc("/ws", handlers.WebsocketHandler)
	http.HandleFunc("/ws-auth", handlers.WebsocketAuthentication)
	http.HandleFunc("/searchUser", handlers.SearchUserHandler)
	http.HandleFunc("/notifications", handlers.NotificationsHandler)

	fmt.Println("Server running on port 8080")
	err := http.ListenAndServe(fmt.Sprintf(":%d", port), nil)
	if err != nil {
		fmt.Println(err)
	}
}
func SessionValidationMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		user := handlers.GetUserFromCookie(r)
		if user == nil {
			handlers.Unauthorized(w, "")
			return
		}
		type contextKey string
		const userKey contextKey = "user"
		// Add the user to the request's context using the custom key
		ctx := context.WithValue(r.Context(), userKey, user)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
