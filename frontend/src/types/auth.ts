export type AuthResponse = {
  token: string;
  expiresAtUtc: string;
  userName: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  middleName: string;
  nickname: string;
  bio: string;
  avatarUrl: string;
  contactEmail: string;
  telegramHandle: string;
  phoneNumber: string;
  studentTicketNumber: number | null;
  groupId: number | null;
  groupTitle: string;
  teamId: number | null;
  teamName: string;
  teamInviteCode: string;
  isCaptain: boolean;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  userName: string;
  email: string;
  password: string;
};
