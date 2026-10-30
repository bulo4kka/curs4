# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Passengers looking for an intercity ride and drivers offering available seats. The home page should give both audiences a clear first action.

## Product Purpose

SeatMate helps people coordinate shared trips across Belarus: passengers find and book seats on listed trips, while drivers publish trips and manage seats.

## Positioning

The product brings trip search, seat booking, driver listings, participant chat, and reviews into one Belarus-focused service with prices shown in BYN.

## Operating Context

People browse on desktop and mobile, set cities and departure dates, compare listed trips, book seats, message participants, and manage their own trips or vehicles. Drivers can create trips; passengers can search and book.

## Capabilities and Constraints

- Preserve the existing React, Vite, React Router, Motion, and Lenis stack.
- Preserve current routes, API calls, authentication, search filters, bookings, vehicle management, chat, reviews, notifications, and admin workflows.
- Keep Russian interface copy and Belarusian city names. Prices use BYN.
- The wallet and some sample user/trip data are mock functionality; do not imply real payment processing.

## Brand Commitments

The product is SeatMate. The redesign uses a dark interface with red as its primary accent, as requested by the user.

## Evidence on Hand

Runnable web application in `client/`; route photography in `client/public/images/`; existing trip, driver, and passenger data comes from the current API and local seed data.

## Product Principles

- Make finding a seat and offering a seat equally understandable.
- Make route, time, price, and available seats easy to compare.
- Keep interactions direct and preserve user-entered search state.
- Use clear status and feedback for booking, messaging, and account actions.
