
"use client";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBorderNone } from '@fortawesome/free-solid-svg-icons';

export default function UpcomingGamesSkeleton() {
  return (
    <div className="cards cards--planned">
      <div className="card card--planned">
        <div className="card__body">
          <p><FontAwesomeIcon icon={faBorderNone} className="fa-icon" /> No upcoming games found...</p>
        </div>
      </div>
    </div>
  )
}