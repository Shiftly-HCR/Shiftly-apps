export interface RecruiterDashboardRow {
  recruiter_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  is_premium: boolean | null;
  establishments_count: number;
  missions_count: number;
}

export interface EstablishmentDashboardRow {
  establishment_id: string;
  name: string;
  city: string | null;
  postal_code: string | null;
  recruiter_id: string | null;
  recruiter_first_name: string | null;
  recruiter_last_name: string | null;
  recruiter_email: string | null;
  commercial_id: string | null;
  commercial_first_name: string | null;
  commercial_last_name: string | null;
  commercial_email: string | null;
  missions_count: number;
}

export interface AdminDashboardResponse {
  recruiters: RecruiterDashboardRow[];
  establishments: EstablishmentDashboardRow[];
}
