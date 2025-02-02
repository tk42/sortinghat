"use client"

import CookieConsent from "react-cookie-consent";

export function Container() {
    return (<CookieConsent
        location="bottom"
        buttonText="理解しました"
        cookieName="cookie-consent"
        style={{ background: "#2B373B", fontSize: "13px" }}
        buttonStyle={{ color: "#4e503b", fontSize: "13px" }}
        expires={150}
    >
        このページは利便性向上のためクッキーを利用しています
    </CookieConsent>)
}