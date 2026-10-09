import type { User } from "@/types/user";

type BookingEligibility = {
  allowed: boolean;
  reason: string | null;
};

function calculateAgeOnDate(
  dateOfBirth: string,
  sessionDate: string,
): number | null {
  const birthParts = dateOfBirth.slice(0, 10).split("-").map(Number);
  const sessionParts = sessionDate.slice(0, 10).split("-").map(Number);

  if (birthParts.length !== 3 || sessionParts.length !== 3) {
    return null;
  }

  const [birthYear, birthMonth, birthDay] = birthParts;
  const [sessionYear, sessionMonth, sessionDay] = sessionParts;

  if (
    !birthYear ||
    !birthMonth ||
    !birthDay ||
    !sessionYear ||
    !sessionMonth ||
    !sessionDay
  ) {
    return null;
  }

  let age = sessionYear - birthYear;

  if (
    sessionMonth < birthMonth ||
    (sessionMonth === birthMonth && sessionDay < birthDay)
  ) {
    age--;
  }

  return age;
}

export function getBookingEligibility(
  user: User | null,
  minimumAge: number | null | undefined,
  sessionDate: string,
): BookingEligibility {
  if (!user) {
    return {
      allowed: false,
      reason: "Please log in to book tickets.",
    };
  }

  if (!user.profileComplete) {
    return {
      allowed: false,
      reason: "Please complete your profile before booking tickets.",
    };
  }

  if (!user.dateOfBirth) {
    return {
      allowed: false,
      reason: "Please add your date of birth to your profile.",
    };
  }

  if (minimumAge != null) {
    const age = calculateAgeOnDate(user.dateOfBirth, sessionDate);

    if (age === null) {
      return {
        allowed: false,
        reason: "We couldn't verify your age.",
      };
    }

    if (age < minimumAge) {
      return {
        allowed: false,
        reason: `You must be at least ${minimumAge} years old to book this movie.`,
      };
    }
  }

  return {
    allowed: true,
    reason: null,
  };
}
