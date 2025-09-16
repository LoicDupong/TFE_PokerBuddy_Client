"use server";

export async function loginAction(state, formData) {
    const data = Object.fromEntries(formData);

    // TODO: call backend API here
    const test = console.log({
    message: "Login attempt",
    data, // tes champs email / password
  });
    
    return test;
    
}