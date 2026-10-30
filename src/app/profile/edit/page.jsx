"use client";

import userService from "@/services/user.service.js";
import { serverUrl } from "@/utils/media.js";
import useToastStore from "@/stores/useToastStore.js";
import useAuthStore from "@/stores/useAuthStore.js";
import { faCheck, faUser, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AccountSettings from "@/components/account-settings/account-settings.jsx";
import { useT } from "@/i18n/i18n-provider.jsx";
import { PROFILE_MESSAGES } from "@/app/profile/profile.messages.js";
import { useDisplayName } from "@/utils/player-name.utils.js";
import { useServerError } from "@/utils/server-errors.utils.js";

export default function EditProfilePage() {
    const { t } = useT(PROFILE_MESSAGES);
    const displayName = useDisplayName();
    const serverError = useServerError();
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({ username: "", description: "", avatar: null });
    const [preview, setPreview] = useState(null); // 🔹 nouvelle state pour la preview
    const [success, setSuccess] = useState(false);
    const [fileError, setFileError] = useState(null);
    const { showToast } = useToastStore();
    const setAuth = useAuthStore((state) => state.setAuth);
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
                setPreview(data.user.avatar ? serverUrl(data.user.avatar) : null);
            }
        })();
    }, []);

    if (!user) return <p>{t("loading")}</p>;

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            const file = files[0];
            if (file && file.size > 2 * 1024 * 1024) {
                setFileError(t("tooLarge"));
                return;
            }
            setFileError(null);
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
            // Nouveau pseudo : le token renvoyé le contient, l'accueil et les notifs l'utilisent
            if (res.data.token) setAuth(res.data.user, res.data.token);
            setSuccess(true);

            setTimeout(() => {
                router.push("/profile");
            }, 500);
        } else {
            showToast(serverError(res.errorMessage?.[0]) || t("updateFailed"));
        }
    };

    const handleCancel = () => {
        router.push("/profile");
    };

    return (
        <>
            <h1>
                {t("editTitleA")} <span className="red">{displayName(user.username)}</span> {t("editTitleB")}
            </h1>
            <section className="section section__user">
                <div className="cards">
                    <div className="card user">
                        <form className="form form--edit" onSubmit={handleConfirm}>
                            <div className="user__avatar">
                                {preview ? (
                                    <img src={preview} alt={t("avatarPreview")} />
                                ) : (
                                    <FontAwesomeIcon icon={faUser} size="xl" className="icon--avatar" />
                                )}
                            </div>
                            <div className="form__row">
                                <label htmlFor="avatar" className="btn btn--user btn--file">
                                    {t("upload")}
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
                {fileError && <p className="form__error">{fileError}</p>}
                            </div>
                            <div className="user__infos">
                                <label htmlFor="username">{t("username")}</label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder={t("username")}
                                    className="input"
                                />
                                <p className="subtitle subtitle--email">{user.email}</p>
                            </div>
                            <div className="user__description">
                                <label htmlFor="description">{t("bio")}</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder={t("bioPh")}
                                    className="textarea"
                                />
                            </div>
                            <div className="btn__container">
                                <button type="submit" className="btn btn--user btn--confirm">
                                    <FontAwesomeIcon icon={faCheck} /> {t("confirm")}
                                </button>
                                <button type="button" className="btn btn--user" onClick={handleCancel}>
                                    <FontAwesomeIcon icon={faXmark} /> {t("cancel")}
                                </button>
                            </div>
                            {success && <p className="success">✅ {t("updated")}</p>}
                        </form>
                    </div>
                </div>
            </section>

            <AccountSettings username={user.username} />
        </>
    );
}
