"use client";

import {
    faCaretDown,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function InvitesSkeleton() {
    return (
        <>
            {/* --- INVITES --- */}
            <section className="section section__invites">
                <h2>
                    Game <span className="red">Invites</span>
                    <span className="expand">
                        <FontAwesomeIcon icon={faCaretDown} />
                    </span>
                </h2>

                <div className="cards cards--invites collapsed">
                    <p>Loading invites...</p>
                </div>
            </section>
        </>
    )
}
