package main

import (
	"database/sql"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"

	"01.kood.tech/git/Maxwell/social-network/backend/models"
	"github.com/gofrs/uuid"
)

func (app *application) CreateGroupHandler(w http.ResponseWriter, r *http.Request) {
	r.ParseMultipartForm(10 << 20)

	var group models.Group

	group.GroupPic = "defaultGroupPic.png"

	file, handler, err := r.FormFile("img")
	if err == nil {
		defer file.Close()

		imgDir := "backend/media/groups"

		imgName := uuid.Must(uuid.NewV4()).String() + filepath.Ext(handler.Filename)

		newFile, err := os.Create(imgDir + "/" + imgName)
		if err != nil {
			log.Println(err)
			return
		}
		defer newFile.Close()

		_, err = io.Copy(newFile, file)
		if err != nil {
			log.Println(err)
			return
		}
		group.GroupPic = imgName
	}

	userIDStr := r.FormValue("userId")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		log.Println(err)
		return
	}

	group.UserID = userID
	group.Title = r.FormValue("groupTitle")
	group.Description = r.FormValue("groupDescription")

	stmt := `INSERT INTO groups (userId, title, description, img) VALUES (?, ?, ?, ?)`
	id, err := app.db.Exec(stmt, group.UserID, group.Title, group.Description, group.GroupPic)
	if err != nil {
		log.Println(err)
	}

	groupId, err := id.LastInsertId()
	if err != nil {
		log.Println(err)
	}
	group.GroupID = int(groupId)

	jsonResponse, err := json.Marshal(group)
	if err != nil {
		http.Error(w, "Error creating JSON response", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(jsonResponse)

}

func (app *application) GetGroupDataHandler(w http.ResponseWriter, r *http.Request) {
	groupId := r.URL.Query().Get("groupId")
	currentUserId := r.URL.Query().Get("currentUserId")
	var group models.Group

	query := `
		SELECT g.groupId, g.userId, g.title, g.description, g.img,
			u.userId, u.firstName, u.lastName, u.profilePic, u.public
		FROM "groups" AS g
		JOIN "users" AS u ON g.userId = u.userId
		WHERE g.groupId = ?
`

	row := app.db.QueryRow(query, groupId)
	err := row.Scan(&group.GroupID, &group.UserID, &group.Title, &group.Description, &group.GroupPic, &group.Owner.UserId, &group.Owner.FirstName, &group.Owner.LastName, &group.Owner.ProfilePic, &group.Owner.Public)
	if err != nil {
		log.Println(err)
	}

	group.Members = getGroupMembers(groupId, currentUserId, app.db)
	group.CurrentUserMemberStatus = getCurrentUserMemberStatus(groupId, currentUserId, group.UserID, app.db)

	jsonData, err := json.Marshal(group)
	if err != nil {
		log.Println(err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(jsonData)
}

func getGroupMembers(groupId, currentUserId string, db *sql.DB) []models.User {
	var members = []models.User{}

	query := `
		SELECT u.userId, u.firstName, u.lastName, u.profilePic, u.public
		FROM users AS u
		INNER JOIN group_members AS gm ON u.userId = gm.memberId
		WHERE gm.groupId = ?
	`

	rows, err := db.Query(query, groupId)
	if err != nil {
		log.Println(err)
	}

	for rows.Next() {
		var member models.User
		err := rows.Scan(&member.UserId, &member.FirstName, &member.LastName, &member.ProfilePic, &member.Public)
		if err != nil {
			log.Println(err)
		}

		member.CurrentUserFollowStatus = getCurrentUserFollowStatus(strconv.Itoa(member.UserId), currentUserId, db)

		members = append(members, member)
	}

	return members
}

func (app *application) GetAllGroupsHandler(w http.ResponseWriter, r *http.Request) {
	var allGroups = []models.Group{}

	query := `
		SELECT g.groupId, g.userId, g.title, g.description, g.img,
			u.userId, u.firstName, u.lastName, u.profilePic
		FROM "groups" AS g
		JOIN "users" AS u ON g.userId = u.userId
	`
	rows, err := app.db.Query(query)
	if err != nil {
		log.Fatalf("Err: %s", err)
	}
	defer rows.Close()

	for rows.Next() {
		var group models.Group

		err = rows.Scan(&group.GroupID, &group.UserID, &group.Title, &group.Description, &group.GroupPic, &group.Owner.UserId, &group.Owner.FirstName, &group.Owner.LastName, &group.Owner.ProfilePic)
		if err != nil {
			log.Fatalf("Err: %s", err)
		}

		allGroups = append(allGroups, group)
	}

	jsonData, err := json.Marshal(allGroups)
	if err != nil {
		log.Println(err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(jsonData)
}

func getCurrentUserMemberStatus(groupId, currentUserId string, groupOwnerId int, db *sql.DB) string {
	if currentUserId == strconv.Itoa(groupOwnerId) {
		return "owner"
	}

	query := `
		SELECT 'group_invitations' AS TableName FROM group_invitations
		WHERE groupId = ? AND invitedUserId = ?
		UNION
		SELECT 'group_members' AS TableName FROM group_members
		WHERE groupId = ? AND memberId = ?
		UNION
		SELECT 'group_request' AS TableName FROM group_request
		WHERE groupId = ? AND requesterId = ?
	`

	var tableName string
	err := db.QueryRow(query, groupId, currentUserId, groupId, currentUserId, groupId, currentUserId).Scan(&tableName)
	if err != nil {
		if err == sql.ErrNoRows {
			return "not_a_member"
		} else {
			panic(err)
		}
	}

	return tableName
}

func (app *application) GetGroupsHandler(w http.ResponseWriter, r *http.Request) {
	currentUserId := r.URL.Query().Get("userId")
	groups := make(map[string]interface{})
	var userGroups []models.Group
	var memberGroups []models.Group

	// get user's groups
	stmt := `
		SELECT groupId, userId, title, img
		FROM groups
		WHERE userId = ?
	`

	rows, err := app.db.Query(stmt, currentUserId)
	if err != nil {
		log.Fatalf("Err: %s", err)
	}
	defer rows.Close()

	for rows.Next() {
		group := models.Group{}

		err = rows.Scan(&group.GroupID, &group.UserID, &group.Title, &group.GroupPic)
		if err != nil {
			log.Fatalf("Err: %s", err)
		}

		userGroups = append(userGroups, group)
	}

	//get other groups
	stmt = `
	    SELECT g.groupId, g.userId, g.title, g.img
		FROM groups AS g
		INNER JOIN group_members AS m ON m.groupId = g.groupId
		WHERE m.memberId = ?
	`
	rows, err = app.db.Query(stmt, currentUserId)
	if err != nil {
		log.Fatalf("Err: %s", err)
	}
	defer rows.Close()

	for rows.Next() {
		group := models.Group{}

		err = rows.Scan(&group.GroupID, &group.UserID, &group.Title, &group.GroupPic)
		if err != nil {
			log.Fatalf("Err: %s", err)
		}

		memberGroups = append(memberGroups, group)
	}

	groups["userGroups"] = userGroups
	groups["memberGroups"] = memberGroups

	jsonResp, err := json.Marshal(groups)
	if err != nil {
		log.Fatalf("Err: %s", err)
	}

	w.Write(jsonResp)
}

func (app *application) GetInvitableUsersHandler(w http.ResponseWriter, r *http.Request) {
	userId := r.URL.Query().Get("userId")
	groupId := r.URL.Query().Get("groupId")
	var invitableUsers = []models.User{}

	query := `
		SELECT
		    u.userId,
		    u.firstName,
		    u.lastName,
		    u.profilePic
		FROM
		    users AS u
		INNER JOIN
		    followers AS f ON u.userId = f.followerId
		LEFT JOIN
		    group_members AS gm ON u.userId = gm.memberId AND gm.groupId = ?
		LEFT JOIN
			group_invitations AS gi ON u.userId = gi.invitedUserId AND gi.groupId = ?
		LEFT JOIN
			group_request AS gr ON u.userId = gr.requesterId AND gr.groupId = ?
		LEFT JOIN
			"groups" AS g ON u.userId = g.userId AND g.groupId = ?
		WHERE
		    f.userId = ?
			AND f.isRequest = false
		    AND gm.memberId IS NULL
			AND gi.invitedUserId IS NULL
			AND gr.requesterId IS NULL
			AND g.userId IS NULL;
	`

	rows, err := app.db.Query(query, groupId, groupId, groupId, groupId, userId)
	if err != nil {
		log.Println(err)
	}

	for rows.Next() {
		var user models.User
		err := rows.Scan(&user.UserId, &user.FirstName, &user.LastName, &user.ProfilePic)
		if err != nil {
			log.Println(err)
		}

		invitableUsers = append(invitableUsers, user)
	}

	jsonResp, err := json.Marshal(invitableUsers)
	if err != nil {
		log.Fatalf("Err: %s", err)
	}

	w.Write(jsonResp)
}

func (app *application) GetGroupInvitesHandler(w http.ResponseWriter, r *http.Request) {
	userId := r.URL.Query().Get("userId")
	var groups = []models.Group{}

	query := `
		SELECT g.groupId, g.title, g.img FROM groups AS g
		INNER JOIN group_invitations AS gi ON g.groupId = gi.groupId
		WHERE gi.invitedUserId = ?
	`

	rows, err := app.db.Query(query, userId)
	if err != nil {
		log.Println(err)
	}

	for rows.Next() {
		var group models.Group
		err := rows.Scan(&group.GroupID, &group.Title, &group.GroupPic)
		if err != nil {
			log.Println(err)
		}

		groups = append(groups, group)
	}

	jsonResp, err := json.Marshal(groups)
	if err != nil {
		log.Fatalf("Err: %s", err)
	}

	w.Write(jsonResp)
}

func (app *application) GetGroupJoinRequestsHandler(w http.ResponseWriter, r *http.Request) {
	groupId := r.URL.Query().Get("groupId")
	var joinRequests = []models.User{}

	query := `
		SELECT u.userId, u.firstName, u.lastName, u.nickname, u.profilePic
		FROM users AS u
		INNER JOIN group_request AS gr ON u.userId = gr.requesterId
		WHERE gr.groupId = ?
	`

	rows, err := app.db.Query(query, groupId)
	if err != nil {
		log.Println(err)
	}

	for rows.Next() {
		var requester models.User
		err := rows.Scan(&requester.UserId, &requester.FirstName, &requester.LastName, &requester.Nickname, &requester.ProfilePic)
		if err != nil {
			log.Println(err)
		}

		joinRequests = append(joinRequests, requester)
	}

	jsonResp, err := json.Marshal(joinRequests)
	if err != nil {
		log.Fatalf("Err: %s", err)
	}

	w.Write(jsonResp)
}

func (app *application) InviteUserHandler(w http.ResponseWriter, r *http.Request) {
	var groupInvite models.GroupInvite
	err := json.NewDecoder(r.Body).Decode(&groupInvite)
	if err != nil {
		log.Println(err)
		return
	}

	statement, err := app.db.Prepare("INSERT INTO group_invitations (groupId, inviterId, invitedUserId) VALUES (?, ?, ?)")
	if err != nil {
		log.Println(err, "4")
		return
	}

	_, err = statement.Exec(groupInvite.GroupId, groupInvite.InviterId, groupInvite.InvitedUserId)
	if err != nil {
		log.Println(err, "5")
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("User successfully invited"))
}

func (app *application) GroupJoinRequestHandler(w http.ResponseWriter, r *http.Request) {
	var groupJoinRequestResp models.GroupInviteResponse

	err := json.NewDecoder(r.Body).Decode(&groupJoinRequestResp)
	if err != nil {
		log.Println(err)
		return
	}

	if groupJoinRequestResp.Accepted {
		statement, err := app.db.Prepare("INSERT INTO group_members (groupId, memberId) VALUES (?, ?)")
		if err != nil {
			log.Println(err, "4")
			return
		}

		_, err = statement.Exec(groupJoinRequestResp.GroupId, groupJoinRequestResp.UserId)
		if err != nil {
			log.Println(err, "5")
			return
		}
	}

	app.db.Exec("DELETE FROM group_request WHERE groupId = ? AND requesterId = ?", groupJoinRequestResp.GroupId, groupJoinRequestResp.UserId)

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Group join request successfully handled"))
}

func (app *application) SendJoinRequestHandler(w http.ResponseWriter, r *http.Request) {
	var joinRequest models.GroupInviteResponse
	err := json.NewDecoder(r.Body).Decode(&joinRequest)
	if err != nil {
		log.Println(err)
		return
	}

	statement, err := app.db.Prepare("INSERT INTO group_request (groupId, requesterId) VALUES (?, ?)")
	if err != nil {
		log.Println(err, "4")
		return
	}

	_, err = statement.Exec(joinRequest.GroupId, joinRequest.UserId)
	if err != nil {
		log.Println(err, "5")
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Request successfully added"))
}

func (app *application) GroupInviteHandler(w http.ResponseWriter, r *http.Request) {
	var groupInviteResp models.GroupInviteResponse

	err := json.NewDecoder(r.Body).Decode(&groupInviteResp)
	if err != nil {
		log.Println(err)
		return
	}

	if groupInviteResp.Accepted {
		statement, err := app.db.Prepare("INSERT INTO group_members (groupId, memberId) VALUES (?, ?)")
		if err != nil {
			log.Println(err, "4")
			return
		}

		_, err = statement.Exec(groupInviteResp.GroupId, groupInviteResp.UserId)
		if err != nil {
			log.Println(err, "5")
			return
		}
	}

	app.db.Exec("DELETE FROM group_invitations WHERE groupId = ? AND invitedUserId = ?", groupInviteResp.GroupId, groupInviteResp.UserId)

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Group invite successfully handled"))
}

func (app *application) GetGroupChatDataHandler(w http.ResponseWriter, r *http.Request) {
	var groupChatData SendGroupChatDataEvent

	err := json.NewDecoder(r.Body).Decode(&groupChatData)
	if err != nil {
		log.Println(err)
		return
	}

	returnGroupChatData := getGroupChatData(groupChatData, app.db)

	jsonData, err := json.Marshal(returnGroupChatData)
	if err != nil {
		log.Println(err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(jsonData)
}

func getGroupChatMessages(groupId, amount int, db *sql.DB) []ReturnGroupMessageEvent {
	var groupMessages = []ReturnGroupMessageEvent{}

	rows, err := db.Query(`
		SELECT messageId, senderId, groupId, content, sent FROM group_messages 
		WHERE groupId = ?
		ORDER BY sent DESC LIMIT ?
	`, groupId, amount)

	if err != nil {
		log.Println(err)
	}
	defer rows.Close()

	for rows.Next() {
		var message ReturnGroupMessageEvent

		rows.Scan(&message.MessageId, &message.SenderId, &message.GroupId, &message.Content, &message.Sent)
		groupMessages = append(groupMessages, message)
	}
	reverseGroupMsgSlice(groupMessages)

	return groupMessages
}

func reverseGroupMsgSlice(s []ReturnGroupMessageEvent) {
	for i, j := 0, len(s)-1; i < j; i, j = i+1, j-1 {
		s[i], s[j] = s[j], s[i]
	}
}

func addGroupMessageToTable(messageData ReturnGroupMessageEvent, db *sql.DB) {
	statement, err := db.Prepare("INSERT INTO group_messages (senderId, groupId, content) VALUES (?, ?, ?)")
	if err != nil {
		log.Println(err)
		return
	}

	_, err = statement.Exec(messageData.SenderId, messageData.GroupId, messageData.Content)
	if err != nil {
		log.Println(err)
		return
	}
}

func getAllGroupMemberIds(groupId int, db *sql.DB) []int {
	userIdSlc := []int{}

	var ownerId int
	db.QueryRow("SELECT userId FROM `groups` WHERE groupId = ?", groupId).Scan(&ownerId)
	userIdSlc = append(userIdSlc, ownerId)

	query := `
		SELECT memberId FROM group_members WHERE groupId = ?
	`

	rows, err := db.Query(query, groupId)
	if err != nil {
		log.Println(err)
	}
	defer rows.Close()

	for rows.Next() {
		var userId int
		rows.Scan(&userId)

		userIdSlc = append(userIdSlc, userId)
	}

	return userIdSlc
}

func getGroupChatData(groupChatData SendGroupChatDataEvent, db *sql.DB) ReturnGroupChatDataEvent {
	var group models.Group
	var returnGroupChatData ReturnGroupChatDataEvent

	query := `
		SELECT g.title,
			u.userId, u.firstName, u.lastName, u.profilePic
		FROM "groups" AS g
		JOIN "users" AS u ON g.userId = u.userId
		WHERE g.groupId = ?
	`

	row := db.QueryRow(query, groupChatData.GroupId)
	err := row.Scan(&group.Title, &group.Owner.UserId, &group.Owner.FirstName, &group.Owner.LastName, &group.Owner.ProfilePic)
	if err != nil {
		log.Println(err)
	}

	group.Members = getGroupMembers(strconv.Itoa(groupChatData.GroupId), strconv.Itoa(groupChatData.CurrentUserId), db)
	group.CurrentUserMemberStatus = getCurrentUserMemberStatus(strconv.Itoa(groupChatData.GroupId), strconv.Itoa(groupChatData.CurrentUserId), group.Owner.UserId, db)

	returnGroupChatData.GroupData = group
	returnGroupChatData.Messages = getGroupChatMessages(groupChatData.GroupId, groupChatData.Amount, db)

	return returnGroupChatData
}
