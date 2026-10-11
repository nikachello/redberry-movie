"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Ticket,
  UserRound,
} from "lucide-react";

import { useAuth } from "@/components/auth/AuthProvider";
import { getTickets, refundTicket, type TicketFilter } from "@/lib/api/tickets";
import type { TicketOrder } from "@/types/ticket";

type ProfileTab = "personal" | "tickets";

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { user, isLoading, openLogin, openProfile } = useAuth();

  const tab: ProfileTab =
    searchParams.get("tab") === "tickets" ? "tickets" : "personal";

  const [ticketFilter, setTicketFilter] = useState<TicketFilter>("upcoming");

  function setTab(nextTab: ProfileTab) {
    router.push(nextTab === "tickets" ? "/profile?tab=tickets" : "/profile", {
      scroll: false,
    });
  }

  useEffect(() => {
    if (!isLoading && !user) {
      openLogin();
    }
  }, [isLoading, user, openLogin]);

  const { data: allTickets = [] } = useQuery({
    queryKey: ["tickets", "all"],
    queryFn: async () => {
      const [upcoming, past] = await Promise.all([
        getTickets("upcoming"),
        getTickets("past"),
      ]);

      return [...upcoming, ...past];
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#080d1c] px-6 pt-28 text-white">
        Loading profile...
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#080d1c] px-6 pt-28 text-white">
        <div className="mx-auto max-w-6xl rounded-2xl bg-[#202235] p-8 text-center">
          <h1 className="text-2xl font-bold">Please sign in</h1>

          <p className="mt-2 text-sm text-white/60">
            Sign in to view your profile and tickets.
          </p>

          <button
            type="button"
            onClick={openLogin}
            className="mt-5 cursor-pointer rounded-full bg-[#f12d17] px-8 py-3 text-sm font-semibold"
          >
            Sign in
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080d1c] px-4 pb-16 pt-28 text-white sm:px-8">
      <div className="mx-auto max-w-[1200px]">
        <h1 className="text-3xl font-bold">My Profile</h1>

        {/* Main tabs */}
        <div className="mt-8 flex gap-8 border-b border-white/10">
          <button
            type="button"
            onClick={() => setTab("personal")}
            className={`flex cursor-pointer items-center gap-2 border-b-2 pb-4 text-sm font-semibold ${
              tab === "personal"
                ? "border-[#f12d17] text-white"
                : "border-transparent text-white/50"
            }`}
          >
            <UserRound size={17} />
            Personal Information
          </button>

          <button
            type="button"
            onClick={() => setTab("tickets")}
            className={`flex cursor-pointer items-center gap-2 border-b-2 pb-4 text-sm font-semibold ${
              tab === "tickets"
                ? "border-[#f12d17] text-white"
                : "border-transparent text-white/50"
            }`}
          >
            <Ticket size={17} />
            My Tickets
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">
              {allTickets.length}
            </span>
          </button>
        </div>

        {tab === "personal" ? (
          <section className="mt-8 max-w-[650px] rounded-2xl bg-[#202235] p-6 sm:p-8">
            {/* Avatar and name */}
            <div className="flex items-center gap-4">
              <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/10">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt="Profile avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserRound size={28} className="text-white/50" />
                )}
              </div>

              <div>
                <h2 className="text-lg font-bold">
                  {user.fullName || user.username}
                </h2>

                <p className="text-sm text-white/50">{user.email}</p>
              </div>
            </div>

            {/* Profile status */}
            <div
              className={`mt-6 rounded-xl p-4 text-sm ${
                user.profileComplete
                  ? "bg-green-500/10 text-green-400"
                  : "bg-yellow-500/10 text-yellow-300"
              }`}
            >
              {user.profileComplete ? (
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={18} />
                  Profile Complete
                </span>
              ) : (
                "Please complete your profile to enable booking."
              )}
            </div>

            {/* Profile details */}
            <div className="mt-6 space-y-5">
              <ProfileField
                label="Full Name"
                value={user.fullName || "Not provided"}
              />

              <ProfileField label="Email Address" value={user.email} />

              <ProfileField
                label="Mobile Number"
                value={user.mobileNumber || "Not provided"}
              />

              <ProfileField
                label="Date of Birth"
                value={user.dateOfBirth || "Not provided"}
              />

              <ProfileField
                label="Preferred Venue"
                value={user.preferredVenue?.name || "No preferred venue"}
              />
            </div>

            <button
              type="button"
              onClick={openProfile}
              className="mt-8 cursor-pointer rounded-full bg-[#f12d17] px-8 py-3 text-sm font-bold transition hover:bg-[#d82713]"
            >
              Edit Personal Information
            </button>
          </section>
        ) : (
          <TicketsSection
            filter={ticketFilter}
            onFilterChange={setTicketFilter}
          />
        )}
      </div>
    </main>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-white/50">{label}</p>

      <div className="rounded-xl bg-[#171a2b] px-4 py-3 text-sm">{value}</div>
    </div>
  );
}

function TicketsSection({
  filter,
  onFilterChange,
}: {
  filter: TicketFilter;
  onFilterChange: (filter: TicketFilter) => void;
}) {
  const queryClient = useQueryClient();

  const [error, setError] = useState<string | null>(null);
  const [confirmOrder, setConfirmOrder] = useState<TicketOrder | null>(null);

  const {
    data: tickets = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["tickets", filter],
    queryFn: () => getTickets(filter),
  });

  const refundMutation = useMutation({
    mutationFn: refundTicket,

    onSuccess: async (updatedOrder) => {
      // Update both cached tabs using the server response.
      queryClient.setQueryData<TicketOrder[]>(
        ["tickets", "upcoming"],
        (current) => current?.filter((order) => order.id !== updatedOrder.id),
      );

      queryClient.setQueryData<TicketOrder[]>(["tickets", "past"], (current) =>
        current
          ? [
              updatedOrder,
              ...current.filter((order) => order.id !== updatedOrder.id),
            ]
          : [updatedOrder],
      );

      setConfirmOrder(null);
      setError(null);

      // Refresh the count and both ticket lists.
      await queryClient.invalidateQueries({
        queryKey: ["tickets"],
      });
    },

    onError: (err: Error) => {
      setError(err.message);
      setConfirmOrder(null);
    },
  });

  return (
    <section className="mt-8">
      {/* Upcoming / Past */}
      <div className="mb-6 flex gap-2">
        {(["upcoming", "past"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              onFilterChange(value);
              setError(null);
            }}
            className={`cursor-pointer rounded-full px-6 py-2.5 text-sm font-semibold capitalize ${
              filter === value
                ? "bg-[#f12d17] text-white"
                : "bg-[#202235] text-white/60"
            }`}
          >
            {value}
          </button>
        ))}
      </div>

      {error && (
        <p
          role="alert"
          className="mb-5 rounded-xl bg-red-500/10 p-4 text-sm text-red-400"
        >
          {error}
        </p>
      )}

      {isPending && <p className="text-sm text-white/50">Loading tickets...</p>}

      {isError && (
        <p className="text-sm text-red-400">Could not load your tickets.</p>
      )}

      {!isPending && !isError && tickets.length === 0 && (
        <div className="rounded-2xl bg-[#202235] p-12 text-center">
          <Ticket size={35} className="mx-auto text-white/30" />

          <h3 className="mt-4 text-lg font-bold">No {filter} tickets</h3>

          <p className="mt-2 text-sm text-white/50">
            Your {filter} bookings will appear here.
          </p>
        </div>
      )}

      {/* Ticket cards */}
      <div className="space-y-4">
        {tickets.map((order) => (
          <TicketCard
            key={order.id}
            order={order}
            onRefund={() => setConfirmOrder(order)}
          />
        ))}
      </div>

      {/* Refund confirmation */}
      {confirmOrder && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/75 px-4">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="refund-title"
            className="w-full max-w-md rounded-2xl bg-[#202235] p-7"
          >
            <h2 id="refund-title" className="text-xl font-bold">
              Refund this booking?
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/60">
              Refund order{" "}
              <strong className="text-white">{confirmOrder.reference}</strong>?
              This action cannot be undone. Your reserved seats will be
              released.
            </p>

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                disabled={refundMutation.isPending}
                onClick={() => setConfirmOrder(null)}
                className="cursor-pointer rounded-full bg-white/10 px-5 py-2.5 text-sm disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={refundMutation.isPending}
                onClick={() => refundMutation.mutate(confirmOrder.reference)}
                className="cursor-pointer rounded-full bg-[#f12d17] px-5 py-2.5 text-sm font-bold disabled:opacity-50"
              >
                {refundMutation.isPending ? "Refunding..." : "Confirm Refund"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function TicketCard({
  order,
  onRefund,
}: {
  order: TicketOrder;
  onRefund: () => void;
}) {
  const { session } = order;

  const refunded = order.status === "refunded" || order.refundedAt !== null;

  return (
    <article className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-[#202235] p-5 md:flex-row">
      {/* Movie poster */}
      <img
        src={session.movie.posterUrl}
        alt={session.movie.title}
        className="h-44 w-32 shrink-0 rounded-xl object-cover"
      />

      {/* Booking details */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-xl font-bold">{session.movie.title}</h3>

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              refunded
                ? "bg-red-500/15 text-red-400"
                : order.isUpcoming
                  ? "bg-green-500/15 text-green-400"
                  : "bg-white/10 text-white/60"
            }`}
          >
            {refunded
              ? "Refunded"
              : order.isUpcoming
                ? "Upcoming"
                : "Completed"}
          </span>
        </div>

        <div className="mt-4 space-y-2 text-sm text-white/65">
          <p className="flex items-center gap-2">
            <MapPin size={16} />
            {session.venue.name} · Hall {session.hall.name}
          </p>

          <p className="flex items-center gap-2">
            <CalendarDays size={16} />
            {session.date}
          </p>

          <p className="flex items-center gap-2">
            <Clock3 size={16} />
            {session.time}
          </p>

          <p>
            {session.format.name} · {session.language.name}
          </p>
        </div>

        {/* Seats and ticket types */}
        <div className="mt-4 flex flex-wrap gap-2">
          {order.tickets.map((ticket) => (
            <span
              key={ticket.id}
              className="rounded-lg bg-[#111629] px-3 py-2 text-xs text-white/80"
            >
              Seat {ticket.seatCode} · {ticket.ticketType.name}
            </span>
          ))}
        </div>
      </div>

      {/* Payment and refund */}
      <div className="flex shrink-0 flex-col justify-between gap-5 border-t border-white/10 pt-4 md:min-w-44 md:border-l md:border-t-0 md:pl-5 md:pt-0">
        <div>
          <p className="text-xs text-white/50">Total Paid</p>

          <p className="mt-1 text-2xl font-bold">
            ₾{order.totalPrice.toFixed(2)}
          </p>

          <p className="mt-3 text-xs text-white/40">Reference</p>

          <p className="mt-1 text-sm font-semibold">{order.reference}</p>
        </div>

        {order.isUpcoming && !refunded && (
          <div
            title={
              order.isRefundable
                ? "Refund this booking"
                : "Refunds are unavailable within 2 hours of the session."
            }
          >
            <button
              type="button"
              disabled={!order.isRefundable}
              onClick={onRefund}
              className="w-full cursor-pointer rounded-full border border-[#f12d17] px-5 py-2.5 text-sm font-bold text-[#ff503c] hover:bg-[#f12d17] hover:text-white disabled:cursor-not-allowed disabled:border-white/20 disabled:text-white/30 disabled:hover:bg-transparent"
            >
              Refund
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
