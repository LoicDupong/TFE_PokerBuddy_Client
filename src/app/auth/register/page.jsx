import Link from "next/link.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock, faUnlock, faUser } from "@fortawesome/free-solid-svg-icons";

export default function RegisterPage() {
  return (
    <>
      <section className="auth auth--login">
        <h1 className="title title--login">Register</h1>

        <form className="form form--auth" id="login-form">
          <div className="form__row">
            <label htmlFor="email"><FontAwesomeIcon icon={faEnvelope}/> Email</label>
            <input type="email" id="email" name="email" placeholder="Enter your email" required />
          </div>

          <div className="form__row">
            <label htmlFor="password"><FontAwesomeIcon icon={faLock}/> Password</label>
            <input type="password" id="password" name="password" placeholder="Enter your password" required />
          </div>

          <button type="submit" className="btn btn--full btn--auth"><FontAwesomeIcon icon={faUser}/> Create Account</button>
        </form>

        <p className="auth__redirect">
          Already have an account? <Link href={'/auth/login'} className="link">Log in here</Link>
        </p>
      </section>

    </>
  );
}