export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginStatus {
  status:
    | 'SUCCESS'
    | 'SUCCESS_GRACE_PERIOD'
    | 'FAIL'
    | 'FAIL_EXPIRED'
    | 'FAIL_LOCKED_OUT'
    | 'FAIL_VERSION_MISMATCH';
  message: string;
  updatedUsername?: string;
}

export interface User {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}
