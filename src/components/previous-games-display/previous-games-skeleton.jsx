
"use client";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBorderNone } from '@fortawesome/free-solid-svg-icons';

export default function PreviousGamesSkeleton() {
    return (
        <div className="cards cards--previous">
            <div className="card card--previous">
                <div className="card__body">
                    <p><FontAwesomeIcon icon={faBorderNone} className="fa-icon" /> No previous games found...</p>
                </div>
            </div>
        </div>
    )
}