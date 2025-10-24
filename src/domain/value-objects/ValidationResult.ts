export class ValidationResult {
  constructor(
    public readonly withinRadius: boolean,
    public readonly distanceMeters: number
  ) {}

  static create(withinRadius: boolean, distanceMeters: number): ValidationResult {
    return new ValidationResult(withinRadius, distanceMeters);
  }

  toObject(): { within_radius: boolean; distance_meters: number } {
    return {
      within_radius: this.withinRadius,
      distance_meters: this.distanceMeters
    };
  }
}