// src/app/types/index.ts


export interface Community {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  adminId: string; // ID of the user who created the community
  members: string[]; // IDs of users who have joined
  memberCount: number;
}


export interface Post{
  id: string;
  title: string;
  contentText: string;
  contentImage: string;
  createdAt: Date;
  authorId: string;
  likes: string[];
}