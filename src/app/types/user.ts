// User types
export interface UserLoginData {
  _id?: string;
  username: string;
  email: string;
  password?: string; // optional in responses
  role?: string;
}

export interface UserLoginRequest {
  email: string;
  password: string;
}

export interface UserLoginResponse {
  accessToken: string;
}

export interface UserDataResponse {
  success: boolean;
  message: string;
  data: UserLoginData[];
}

export interface UserUpdatePayload {
  id: string;
  formData: FormData;
}

// Role types
export interface RoleData {
  _id: string;
  role: string;
}

export interface RoleDataResponse {
  success: boolean;
  message: string;
  data: RoleData[];
}

export interface SingleRoleDataResponse {
  success: boolean;
  message: string;
  data: RoleData;
}

export interface RoleUpdatePayload {
  id: string;
  formData: FormData;
}
