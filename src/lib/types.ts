export interface UserSummary {
    id: number;
    email: string;
    username?: string | null;
}

export interface PostSummary {
    id: number;
    content: string;
    createdat?: string | Date | null;
}

export interface User {
    id: number;
    email: string;
    username?: string | null;
    newuser?: boolean | null;
    googleid?: string | null;
    provider?: string | null;
    createdat?: string | Date | null;
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
    createdat?: string | Date | null;
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
    createdat?: string | Date | null;
    user?: UserSummary | null;
}

export interface Like {
    id: number;
    createdat?: string | Date | null;
    post: PostSummary;
    user: UserSummary;
}

export interface Repost {
    id: number;
    createdat?: string | Date | null;
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
    createdat?: string | Date | null;
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
    createdat?: string | Date | null;
    sender: UserSummary;
    recipient: UserSummary;
}

export interface UserFollows {
    userid: number;
    followerid: number;
    user?: UserSummary;
    follower?: UserSummary;
}