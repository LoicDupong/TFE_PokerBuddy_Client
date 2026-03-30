"use client";

export default function FriendInvitesSkeleton() {
    return (
        <section className="section section__invites">
            <h2>
                Friend <span className="red">Invites</span>
            </h2>
            <div className="cards cards--invites collapsed">
                <p>Loading invites...</p>
            </div>
        </section>
    );
}
