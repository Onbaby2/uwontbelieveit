export interface FamilyRelationship {
  value: string
  label: string
}

export const FAMILY_RELATIONSHIPS: FamilyRelationship[] = [
  { value: "parent", label: "Parent" },
  { value: "spouse", label: "Spouse" },
  { value: "child", label: "Child" },
  { value: "sibling", label: "Sibling" },
  { value: "grandparent", label: "Grandparent" },
  { value: "grandchild", label: "Grandchild" },
  { value: "aunt_uncle", label: "Aunt/Uncle" },
  { value: "cousin", label: "Cousin" },
  { value: "in_law", label: "In-law" },
  { value: "mosque_member", label: "Mosque Member" },
  { value: "community_member", label: "Community Member" },
]

export interface SignUpFormData {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  phoneNumber: string
  agreeToTerms: boolean
  agreeToPrivacy: boolean
}

export interface ForumReply {
  id: string;
  content: string;
  author_id?: string;
  author_name: string;
  created_at: string;
  parent_id?: string | null;
  replies?: ForumReply[];
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: string;
  author_id: string;
  authorInitials: string;
  authorAvatar: string;
  category: string;
  categoryColor: string;
  time: string;
  replies: ForumReply[];
  views: number;
  likes: number;
  isPinned: boolean;
  isLiked?: boolean;
}
