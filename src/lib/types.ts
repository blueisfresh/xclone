export interface UserSummary {
    id: number;
    email: string;
    username?: string | null;
}

export interface PostSummary {
    id: number;
    content: string;
    createdAt?: string | Date | null;
}

export interface User {
    id: number;
    email: string;
    username?: string | null;
    newUser?: boolean | null;
    providerId?: string | null;
    provider?: string | null;
    createdAt?: string | Date | null;
    profile?: Profile | null;
    _count?: {
        posts: number;
        followers: number;
        following: number;
    };
}

export interface Profile {
    id: number;
    name: string;
    bio?: string | null;
    img?: string | null;
    website?: string | null;
    dob?: string | Date | null;
    userId?: number | null;
}

export interface Post {
    id: number;
    content: string;
    createdAt?: string | Date | null;
    user?: UserSummary | null;
    parent?: PostSummary | null;
    _count?: {
        replies: number;
        likes: number;
        reposts: number;
    };
}

export interface Session {
    id: number;
    refreshtoken: string;
    expirationtime: string | Date;
    createdAt?: string | Date | null;
    user?: UserSummary | null;
}

export interface Like {
    id: number;
    createdAt?: string | Date | null;
    post: PostSummary;
    user: UserSummary;
}

export interface Repost {
    id: number;
    createdAt?: string | Date | null;
    post: PostSummary;
    user: UserSummary;
}

export interface Chat {
    id: number;
    user: UserSummary;
    participant: UserSummary;
    messages?: Message[];
}

export interface Message {
    id: number;
    content: string;
    createdAt?: string | Date | null;
    read?: boolean | null;
    user: UserSummary;
    chatId?: number | null;
}

export interface Notification {
    id: number;
    type: string;
    objecttype: string;
    objecturi: number;
    read?: boolean | null;
    createdAt?: string | Date | null;
    sender: UserSummary;
    recipient: UserSummary;
}

export interface UserFollows {
    userId: number;
    followerId: number;
    user?: UserSummary;
    follower?: UserSummary;
}