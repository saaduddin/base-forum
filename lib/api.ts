export class ForumAPI {
  private static getHeaders(token?: string) {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    return headers
  }

  // Auth
  static async register(data: {
    username: string
    email: string
    password: string
    displayName?: string
  }) {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || "Registration failed")
    }
    return res.json()
  }

  static async login(login: string, password: string) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ login, password }),
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || "Login failed")
    }
    return res.json()
  }

  static async getMe(token: string) {
    const res = await fetch("/api/auth/me", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
    if (!res.ok) throw new Error("Failed to fetch user")
    return res.json()
  }

  static async forgotPassword(email: string) {
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    })
    if (!res.ok) throw new Error("Failed to request password reset")
    return res.json()
  }

  static async resetPassword(
    data: {
      password?: string
      oldPassword?: string
      email?: string
    },
    token?: string,
  ) {
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: this.getHeaders(token),
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("Failed to reset password")
    return res.json()
  }

  // Users - proxy through Next.js API routes
  static async getUsers(params?: {
    page?: number
    limit?: number
    search?: string
    cursor?: string
  }) {
    const query = new URLSearchParams(params as any).toString()
    const res = await fetch(`/api/users?${query}`)
    if (!res.ok) throw new Error("Failed to fetch users")
    return res.json()
  }

  static async getUser(id: string) {
    const res = await fetch(`/api/users/${id}`)
    if (!res.ok) throw new Error("Failed to fetch user")
    return res.json()
  }

  static async updateUser(id: string, data: any, token: string) {
    const res = await fetch(`/api/users/${id}`, {
      method: "PUT",
      headers: this.getHeaders(token),
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("Failed to update user")
    return res.json()
  }

  static async deleteUser(id: string, token: string) {
    const res = await fetch(`/api/users/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(token),
    })
    if (!res.ok) throw new Error("Failed to delete user")
    return res.json()
  }

  // Follow/Unfollow User Methods
  static async followUser(userId: string, token: string) {
    const res = await fetch(`/api/users/${userId}/followers`, {
      method: "POST",
      headers: this.getHeaders(token),
      body: JSON.stringify({ extendedData: {} }),
    })
    if (!res.ok) throw new Error("Failed to follow user")
    return res.json()
  }

  static async unfollowUser(userId: string, token: string) {
    const res = await fetch(`/api/users/${userId}/followers`, {
      method: "DELETE",
      headers: this.getHeaders(token),
    })
    if (!res.ok) throw new Error("Failed to unfollow user")
    return res.json()
  }

  static async getUserFollowers(userId: string, query?: string, cursor?: string) {
    const url = new URL(`/api/users/${userId}/followers`, window.location.origin)
    if (query) url.searchParams.set("query", query)
    if (cursor) url.searchParams.set("cursor", cursor)

    const res = await fetch(url.toString())
    if (!res.ok) throw new Error("Failed to fetch followers")
    return res.json()
  }

  static async getUserFollowing(userId: string, query?: string, cursor?: string) {
    const url = new URL(`/api/users/${userId}/following`, window.location.origin)
    if (query) url.searchParams.set("query", query)
    if (cursor) url.searchParams.set("cursor", cursor)

    const res = await fetch(url.toString())
    if (!res.ok) throw new Error("Failed to fetch following")
    return res.json()
  }

  // Threads - proxy through Next.js API routes
  static async getThreads(params?: {
    page?: number
    limit?: number
    cursor?: string
    tagId?: string
    userId?: string
    pinned?: boolean
    sort?: string
    filter?: string
  }) {
    const queryParams = { ...params }
    if (queryParams.sort && !queryParams.filter) {
      queryParams.filter = queryParams.sort
      delete queryParams.sort
    }
    const query = new URLSearchParams(queryParams as any).toString()
    const res = await fetch(`/api/threads?${query}`)
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || "Failed to fetch threads")
    }
    return res.json()
  }

  static async getThread(id: string) {
    const res = await fetch(`/api/threads/${id}`)
    if (!res.ok) throw new Error("Failed to fetch thread")
    return res.json()
  }

  static async createThread(data: any, token: string) {
    const res = await fetch("/api/threads", {
      method: "POST",
      headers: this.getHeaders(token),
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("Failed to create thread")
    return res.json()
  }

  static async updateThread(id: string, data: any, token: string) {
    const res = await fetch(`/api/threads/${id}`, {
      method: "PUT",
      headers: this.getHeaders(token),
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("Failed to update thread")
    return res.json()
  }

  static async deleteThread(id: string, token: string) {
    const res = await fetch(`/api/threads/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(token),
    })
    if (!res.ok) throw new Error("Failed to delete thread")
    return res.json()
  }

  // Posts - proxy through Next.js API routes
  static async getPosts(params?: {
    threadId?: string
    userId?: string
    page?: number
    limit?: number
    query?: string
    cursor?: string
    filter?: string
  }) {
    // If threadId is provided, use the thread-specific endpoint
    if (params?.threadId) {
      const queryParams = new URLSearchParams()
      if (params.query) queryParams.append("query", params.query)
      if (params.cursor) queryParams.append("cursor", params.cursor)
      if (params.limit) queryParams.append("limit", params.limit.toString())
      if (params.filter) queryParams.append("filter", params.filter)

      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ""
      const res = await fetch(`/api/threads/${params.threadId}/posts${queryString}`)
      if (!res.ok) throw new Error("Failed to fetch posts")
      return res.json()
    }

    // Otherwise use the general posts endpoint
    const query = new URLSearchParams(params as any).toString()
    const res = await fetch(`/api/posts?${query}`)
    if (!res.ok) throw new Error("Failed to fetch posts")
    return res.json()
  }

  static async getPost(id: string) {
    const res = await fetch(`/api/posts/${id}`)
    if (!res.ok) throw new Error("Failed to fetch post")
    return res.json()
  }

  static async createPost(data: any, token: string) {
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: this.getHeaders(token),
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("Failed to create post")
    return res.json()
  }

  static async updatePost(id: string, data: any, token: string) {
    const res = await fetch(`/api/posts/${id}`, {
      method: "PUT",
      headers: this.getHeaders(token),
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("Failed to update post")
    return res.json()
  }

  static async deletePost(id: string, token: string) {
    const res = await fetch(`/api/posts/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(token),
    })
    if (!res.ok) throw new Error("Failed to delete post")
    return res.json()
  }

  static async likePost(id: string, hasLiked: boolean, token: string) {
    const method = hasLiked ? "DELETE" : "POST"
    const res = await fetch(`/api/posts/${id}/like`, {
      method,
      headers: this.getHeaders(token),
    })
    if (!res.ok) throw new Error("Failed to like post")
    return res.json()
  }

  static async dislikePost(id: string, hasDisliked: boolean, token: string) {
    const method = hasDisliked ? "DELETE" : "POST"
    const res = await fetch(`/api/posts/${id}/dislike`, {
      method,
      headers: this.getHeaders(token),
    })
    if (!res.ok) throw new Error("Failed to dislike post")
    return res.json()
  }

  static async downvotePost(id: string, token: string) {
    const res = await fetch(`/api/posts/${id}/downvote`, {
      method: "POST",
      headers: this.getHeaders(token),
    })
    if (!res.ok) throw new Error("Failed to downvote post")
    return res.json()
  }

  static async removeDownvotePost(id: string, token: string) {
    const res = await fetch(`/api/posts/${id}/downvote`, {
      method: "DELETE",
      headers: this.getHeaders(token),
    })
    if (!res.ok) throw new Error("Failed to remove downvote")
    return res.json()
  }

  // Best Answer Methods
  static async markBestAnswer(postId: string, token: string) {
    const res = await fetch(`/api/posts/${postId}`, {
      method: "PUT",
      headers: this.getHeaders(token),
      body: JSON.stringify({ bestAnswer: true }),
    })
    if (!res.ok) throw new Error("Failed to mark as best answer")
    return res.json()
  }

  static async unmarkBestAnswer(postId: string, token: string) {
    const res = await fetch(`/api/posts/${postId}`, {
      method: "PUT",
      headers: this.getHeaders(token),
      body: JSON.stringify({ bestAnswer: false }),
    })
    if (!res.ok) throw new Error("Failed to unmark best answer")
    return res.json()
  }

  // Tags - proxy through Next.js API routes
  static async getTags() {
    const res = await fetch("/api/tags")
    if (!res.ok) throw new Error("Failed to fetch tags")
    return res.json()
  }

  static async getTag(id: string) {
    const res = await fetch(`/api/tags/${id}`)
    if (!res.ok) throw new Error("Failed to fetch tag")
    return res.json()
  }

  static async createTag(data: any, token: string) {
    const res = await fetch("/api/tags", {
      method: "POST",
      headers: this.getHeaders(token),
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("Failed to create tag")
    return res.json()
  }

  static async updateTag(id: string, data: any, token: string) {
    const res = await fetch(`/api/tags/${id}`, {
      method: "PUT",
      headers: this.getHeaders(token),
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("Failed to update tag")
    return res.json()
  }

  static async deleteTag(id: string, token: string) {
    const res = await fetch(`/api/tags/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(token),
    })
    if (!res.ok) throw new Error("Failed to delete tag")
    return res.json()
  }

  // Subscribe/Unsubscribe Tag Methods
  static async subscribeToTag(tagId: string, userId: string, token: string) {
    const res = await fetch(`/api/tags/${tagId}/subscribers`, {
      method: "POST",
      headers: this.getHeaders(token),
      body: JSON.stringify({ userId }),
    })
    if (!res.ok) throw new Error("Failed to subscribe to tag")
    return res.json()
  }

  static async unsubscribeFromTag(tagId: string, userId: string, token: string) {
    const res = await fetch(`/api/tags/${tagId}/subscribers?userId=${userId}`, {
      method: "DELETE",
      headers: this.getHeaders(token),
    })
    if (!res.ok) throw new Error("Failed to unsubscribe from tag")
    return res.json()
  }

  static async getSubscribedTags(userId: string, query?: string, cursor?: string) {
    const url = new URL("/api/tags/subscribed", window.location.origin)
    url.searchParams.set("userId", userId)
    if (query) url.searchParams.set("query", query)
    if (cursor) url.searchParams.set("cursor", cursor)

    const res = await fetch(url.toString())
    if (!res.ok) throw new Error("Failed to fetch subscribed tags")
    return res.json()
  }

  // Likes & Upvotes - these can stay as direct calls since they require user tokens
  static async likeThread(id: string, dislike: boolean, token: string) {
    const res = await fetch(`/api/threads/${id}/like`, {
      method: "POST",
      headers: this.getHeaders(token),
      body: JSON.stringify({ dislike }),
    })
    if (!res.ok) throw new Error("Failed to like thread")
    return res.json()
  }

  static async upvoteThread(id: string, downvote: boolean, token: string) {
    const res = await fetch(`/api/threads/${id}/upvote`, {
      method: "POST",
      headers: this.getHeaders(token),
      body: JSON.stringify({ downvote }),
    })
    if (!res.ok) throw new Error("Failed to upvote thread")
    return res.json()
  }

  static async dislikeThread(id: string, hasDisliked: boolean, token: string) {
    if (hasDisliked) {
      return this.removeDislikeThread(id, token)
    }
    const res = await fetch(`/api/threads/${id}/dislike`, {
      method: "POST",
      headers: this.getHeaders(token),
    })
    if (!res.ok) throw new Error("Failed to dislike thread")
    return res.json()
  }

  static async removeDislikeThread(id: string, token: string) {
    const res = await fetch(`/api/threads/${id}/dislike`, {
      method: "DELETE",
      headers: this.getHeaders(token),
    })
    if (!res.ok) throw new Error("Failed to remove dislike")
    return res.json()
  }

  static async downvoteThread(id: string, hasDownvoted: boolean, token: string) {
    if (hasDownvoted) {
      return this.removeDownvoteThread(id, token)
    }
    const res = await fetch(`/api/threads/${id}/downvote`, {
      method: "POST",
      headers: this.getHeaders(token),
    })
    if (!res.ok) throw new Error("Failed to downvote thread")
    return res.json()
  }

  static async removeDownvoteThread(id: string, token: string) {
    const res = await fetch(`/api/threads/${id}/downvote`, {
      method: "DELETE",
      headers: this.getHeaders(token),
    })
    if (!res.ok) throw new Error("Failed to remove downvote")
    return res.json()
  }

  // Notifications
  static async getNotifications(token: string) {
    const res = await fetch("/api/notifications", {
      headers: this.getHeaders(token),
    })
    if (!res.ok) throw new Error("Failed to fetch notifications")
    return res.json()
  }

  static async getNotification(id: string, token: string) {
    const res = await fetch(`/api/notifications/${id}`, {
      headers: this.getHeaders(token),
    })
    if (!res.ok) throw new Error("Failed to fetch notification")
    return res.json()
  }

  static async deleteNotification(id: string, token: string) {
    const res = await fetch(`/api/notifications/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(token),
    })
    if (!res.ok) throw new Error("Failed to delete notification")
    return res.json()
  }

  static async markNotificationRead(id: string, token: string) {
    const res = await fetch(`/api/notifications/${id}/read`, {
      method: "PUT",
      headers: this.getHeaders(token),
    })
    if (!res.ok) throw new Error("Failed to mark notification as read")
    return res.json()
  }

  // Private Messages
  static async getPrivateMessages(token: string) {
    const res = await fetch("/api/messages", {
      headers: this.getHeaders(token),
    })
    if (!res.ok) throw new Error("Failed to fetch private messages")
    return res.json()
  }

  static async getPrivateMessage(id: string, token: string) {
    const res = await fetch(`/api/messages/${id}`, {
      headers: this.getHeaders(token),
    })
    if (!res.ok) throw new Error("Failed to fetch private message")
    return res.json()
  }

  static async sendPrivateMessage(data: any, token: string) {
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: this.getHeaders(token),
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("Failed to send private message")
    return res.json()
  }

  static async deletePrivateMessage(id: string, token: string) {
    const res = await fetch(`/api/messages/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(token),
    })
    if (!res.ok) throw new Error("Failed to delete private message")
    return res.json()
  }

  // Reports
  static async getReports(token: string) {
    const res = await fetch("/api/reports", {
      headers: this.getHeaders(token),
    })
    if (!res.ok) throw new Error("Failed to fetch reports")
    return res.json()
  }

  static async getReport(id: string, token: string) {
    const res = await fetch(`/api/reports/${id}`, {
      headers: this.getHeaders(token),
    })
    if (!res.ok) throw new Error("Failed to fetch report")
    return res.json()
  }

  static async createReport(data: any, token: string) {
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: this.getHeaders(token),
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("Failed to create report")
    return res.json()
  }

  static async updateReport(id: string, data: any, token: string) {
    const res = await fetch(`/api/reports/${id}`, {
      method: "PUT",
      headers: this.getHeaders(token),
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("Failed to update report")
    return res.json()
  }

  static async deleteReport(id: string, token: string) {
    const res = await fetch(`/api/reports/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(token),
    })
    if (!res.ok) throw new Error("Failed to delete report")
    return res.json()
  }

  // Roles
  static async getRoles(token: string) {
    const res = await fetch("/api/roles", {
      headers: this.getHeaders(token),
    })
    if (!res.ok) throw new Error("Failed to fetch roles")
    return res.json()
  }

  static async getRole(id: string, token: string) {
    const res = await fetch(`/api/roles/${id}`, {
      headers: this.getHeaders(token),
    })
    if (!res.ok) throw new Error("Failed to fetch role")
    return res.json()
  }

  static async createRole(data: any, token: string) {
    const res = await fetch("/api/roles", {
      method: "POST",
      headers: this.getHeaders(token),
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("Failed to create role")
    return res.json()
  }

  // Search
  static async search(params: {
    q: string
    limit?: number
  }) {
    const searchQuery = params.q
    const limit = params.limit || 20

    // Make parallel requests for each search type
    const [threadsRes, postsRes, usersRes, tagsRes] = await Promise.allSettled([
      fetch(`/api/search?query=${encodeURIComponent(searchQuery)}&type=threads&limit=${limit}`),
      fetch(`/api/search?query=${encodeURIComponent(searchQuery)}&type=posts&limit=${limit}`),
      fetch(`/api/search?query=${encodeURIComponent(searchQuery)}&type=users&limit=${limit}`),
      fetch(`/api/search?query=${encodeURIComponent(searchQuery)}&type=tags&limit=${limit}`),
    ])

    const threads =
      threadsRes.status === "fulfilled" && threadsRes.value.ok ? (await threadsRes.value.json()).threads || [] : []
    const posts = postsRes.status === "fulfilled" && postsRes.value.ok ? (await postsRes.value.json()).posts || [] : []
    const users = usersRes.status === "fulfilled" && usersRes.value.ok ? (await usersRes.value.json()).users || [] : []
    const tags = tagsRes.status === "fulfilled" && tagsRes.value.ok ? (await tagsRes.value.json()).tags || [] : []

    return {
      results: {
        threads,
        posts,
        users,
        tags,
      },
    }
  }

  // Stats
  static async getStats() {
    const res = await fetch("/api/stats")
    if (!res.ok) throw new Error("Failed to fetch stats")
    return res.json()
  }

  // Webhooks
  static async getWebhooks(token: string) {
    const res = await fetch("/api/webhooks", {
      headers: this.getHeaders(token),
    })
    if (!res.ok) throw new Error("Failed to fetch webhooks")
    return res.json()
  }

  static async createWebhook(data: any, token: string) {
    const res = await fetch("/api/webhooks", {
      method: "POST",
      headers: this.getHeaders(token),
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("Failed to create webhook")
    return res.json()
  }

  static async deleteWebhook(id: string, token: string) {
    const res = await fetch(`/api/webhooks/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(token),
    })
    if (!res.ok) throw new Error("Failed to delete webhook")
    return res.json()
  }

  static async getWebhookDeliveries(id: string, cursor?: string, token?: string) {
    const url = new URL(`/api/webhooks/${id}/deliveries`, window.location.origin)
    if (cursor) url.searchParams.set("cursor", cursor)

    const res = await fetch(url.toString(), {
      headers: this.getHeaders(token),
    })
    if (!res.ok) throw new Error("Failed to fetch webhook deliveries")
    return res.json()
  }

  // Integrations
  static async getIntegrations(token: string) {
    const res = await fetch("/api/integrations", {
      headers: this.getHeaders(token),
    })
    if (!res.ok) throw new Error("Failed to fetch integrations")
    return res.json()
  }

  static async createIntegration(data: any, token: string) {
    const res = await fetch("/api/integrations", {
      method: "POST",
      headers: this.getHeaders(token),
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("Failed to create integration")
    return res.json()
  }

  static async getIntegration(id: string, token: string) {
    const res = await fetch(`/api/integrations/${id}`, {
      headers: this.getHeaders(token),
    })
    if (!res.ok) throw new Error("Failed to fetch integration")
    return res.json()
  }

  static async deleteIntegration(id: string, token: string) {
    const res = await fetch(`/api/integrations/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(token),
    })
    if (!res.ok) throw new Error("Failed to delete integration")
    return res.json()
  }

  static async testIntegration(integrationId: string, token: string) {
    const res = await fetch("/api/integrations/test", {
      method: "POST",
      headers: this.getHeaders(token),
      body: JSON.stringify({ integrationId }),
    })
    if (!res.ok) throw new Error("Failed to test integration")
    return res.json()
  }

  // Polls
  static async getPoll(threadId: string, token?: string) {
    const res = await fetch(`/api/threads/${threadId}/poll`, {
      headers: this.getHeaders(token),
    })
    if (!res.ok) throw new Error("Failed to fetch poll")
    return res.json()
  }

  static async getPollResults(threadId: string, token?: string) {
    const res = await fetch(`/api/threads/${threadId}/poll/results`, {
      headers: this.getHeaders(token),
    })
    if (!res.ok) throw new Error("Failed to fetch poll results")
    return res.json()
  }

  static async votePoll(threadId: string, optionId: string, token: string) {
    const res = await fetch(`/api/threads/${threadId}/poll/votes`, {
      method: "POST",
      headers: this.getHeaders(token),
      body: JSON.stringify({ optionId }),
    })
    if (!res.ok) throw new Error("Failed to vote")
    return res.json()
  }

  static async updatePollVote(threadId: string, optionId: string, token: string) {
    const res = await fetch(`/api/threads/${threadId}/poll/votes`, {
      method: "PUT",
      headers: this.getHeaders(token),
      body: JSON.stringify({ optionId }),
    })
    if (!res.ok) throw new Error("Failed to update vote")
    return res.json()
  }

  static async deletePollVote(threadId: string, token: string) {
    const res = await fetch(`/api/threads/${threadId}/poll/votes`, {
      method: "DELETE",
      headers: this.getHeaders(token),
    })
    if (!res.ok) throw new Error("Failed to delete vote")
    return res.ok
  }
}
