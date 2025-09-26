"use client";

import gameInviteService from '@/services/gameInvite.service.js';
import {
    faCaretUp,
    faCaretDown,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';

export default function InvitesSkeleton() {
    const [invites, setInvites] = useState([]);
    const [isExpanded, setIsExpanded] = useState(false);


    useEffect(() => {
        (async () => {
            const dataInvites = await gameInviteService.getMyInvites();
            if (dataInvites) setInvites(dataInvites);
        })();
    }, []);


    return (
        <>
            {/* --- INVITES --- */}
            <section className="section section__invites">
                <h2>
                    Game <span className="red">Invites</span> ({invites.length})
                    <span className="expand" onClick={() => setIsExpanded(!isExpanded)}>
                        <FontAwesomeIcon icon={isExpanded ? faCaretUp : faCaretDown} />
                    </span>
                </h2>

                <div className={`cards cards--invites ${isExpanded ? "expanded" : "collapsed"}`}>
                    <p>No game invites at the moment.</p>
                </div>
            </section>
        </>
    )
}