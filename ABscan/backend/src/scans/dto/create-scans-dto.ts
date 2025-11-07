export class CreateScansDTO {
  readonly user: number;
  readonly isAb: boolean;
}

export class ScansQueryDto {
  searchId?: string;
  sortBy?: 'date' | 'status';
  sortOrder?: 'asc' | 'desc';
}
