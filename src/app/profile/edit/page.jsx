"use client";

import userService from "@/services/user.service.js";
import { faCheck, faUser, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function EditProfilePage() {
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({ username: "", description: "", avatar: null });
    const [preview, setPreview] = useState(null); // 🔹 nouvelle state pour la preview
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    useEffect(() => {
        (async () => {
            const data = await userService.getMe();
            if (data?.user) {
                setUser(data.user);
                setFormData({
                    username: data.user.username || "",
                    description: data.user.description || "",
                    avatar: null,
                });
                setPreview(data.user.avatar ? `http://localhost:8080${data.user.avatar}` : null);
            }
        })();
    }, []);

    if (!user) return <p>Loading...</p>;

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            const file = files[0];
            if (file && file.size > 2 * 1024 * 1024) {
                alert("❌ File too large (max 2MB)");
                return;
            }
            setFormData({ ...formData, [name]: file });
            setPreview(URL.createObjectURL(file)); // 🔹 met à jour la preview
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleConfirm = async (e) => {
        e.preventDefault();
        const res = await userService.updateMe(formData);
        if (res.success) {
            setSuccess(true);

            setTimeout(() => {
                router.push("/profile");
            }, 500);
        } else {
            alert(res.errorMessage?.[0] || "Update failed");
        }
    };

    const handleCancel = () => {
        router.push("/profile");
    };

    return (
        <>
            <h1>
                Edit <span className="red">{user.username}</span> Profile
            </h1>
            <section className="section section__user">
                <div className="cards">
                    <div className="card user">
                        <form className="form form--edit" onSubmit={handleConfirm}>
                            <div className="user__avatar">
                                {preview ? (
                                    <img src={preview} alt="Avatar preview" />
                                ) : (
                                    <FontAwesomeIcon icon={faUser} size="xl" className="icon--avatar" />
                                )}
                            </div>
                            <div className="form__row">
                                <label htmlFor="avatar" className="btn btn--user btn--file">
                                    Upload avatar
                                </label>
                                <input
                                    type="file"
                                    id="avatar"
                                    name="avatar"
                                    accept="image/png, image/jpeg"
                                    onChange={handleChange}
                                    className="input--file"
                                />
                                {formData.avatar && <p className="file__name">{formData.avatar.name}</p>}
                            </div>
                            <div className="user__infos">
                                <label htmlFor="username">Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Username"
                                    className="input"
                                />
                                <p className="subtitle subtitle--email">{user.email}</p>
                            </div>
                            <div className="user__description">
                                <label htmlFor="description">Your short bio</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Write a short bio..."
                                    className="textarea"
                                />
                            </div>
                            <div className="btn__container">
                                <button type="submit" className="btn btn--user btn--confirm">
                                    <FontAwesomeIcon icon={faCheck} /> Confirm
                                </button>
                                <div className="btn btn--user" onClick={handleCancel}>
                                    <FontAwesomeIcon icon={faXmark} /> Cancel
                                </div>
                            </div>
                            {success && <p className="success">✅ Profile updated! Redirecting...</p>}
                        </form>
                    </div>
                </div>
            </section>
        </>
    );
}
