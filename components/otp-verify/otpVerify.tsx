import { error, success } from "components/alert/toast";
import PrimaryButton from "components/button/primaryButton";
import { useFormik } from "formik";
import { useTranslation } from "react-i18next";
import OtpInput from "react-otp-input";
import authService from "services/auth";
import cls from "./otpVerify.module.scss";
import { Stack } from "@mui/material";
import { useEffect } from "react";
import { useMutation } from "react-query";
import { useCountDown } from "hooks/useCountDown";
import { useSettings } from "contexts/settings/settings.context";
import { useAuth } from "contexts/auth/auth.context";
import { setCookie } from "../../utils/session";

type RegisterViews = "REGISTER" | "VERIFY" | "COMPLETE";

interface formValues {
  verifyId?: string;
  verifyCode?: string;
}

type Props = {
  email: string;
  changeView: (view: RegisterViews) => void;
  callback?: any;
  setCallback?: (data: any) => void;
  verifyId?: string;
  onSuccess?: (data: any) => void;
};

export default function OTPVerify({
  email,
  changeView,
  callback,
  setCallback,
  verifyId,
  onSuccess,
}: Props) {
  const { t } = useTranslation();
  const { setUserData } = useAuth();
  const { mutate: resend, isLoading: isResending } = useMutation(
    ["resend"],
    (data: { email: string }) => authService.resendVerify(data),
  );
  const { settings } = useSettings();
  const waitTime = settings.otp_expire_time * 60 || 60;
  const [time, timerStart, _, timerReset] = useCountDown(waitTime);
  const { phoneNumberSignIn } = useAuth();

  const isUsingCustomPhoneSignIn =
    process.env.NEXT_PUBLIC_CUSTOM_PHONE_SINGUP === "true";

  const formik = useFormik({
    initialValues: {},
    onSubmit: (values: formValues, { setSubmitting }) => {
      if (email.includes("@")) {
        authService
          .verifyEmail(values)
          .then(() => {
            changeView("COMPLETE");
          })
          .catch(() => error(t("verify.error")))
          .finally(() => setSubmitting(false));
      } else {
        if (isUsingCustomPhoneSignIn) {
          authService
            .verifyPhone({ verifyCode: values.verifyId, verifyId })
            .then(({ data }) => {
              const token = "Bearer" + " " + data.token;
              setCookie("access_token", token);
              setUserData(data.user);
              changeView("COMPLETE");
            })
            .catch(() => error(t("verify.error")))
            .finally(() => setSubmitting(false));
        } else {
          callback
            .confirm(values.verifyId || "")
            .then(() => changeView("COMPLETE"))
            .catch(() => error(t("verify.error")))
            .finally(() => setSubmitting(false));
        }
      }
    },
    validate: (values: formValues) => {
      const errors: formValues = {};
      if (!values.verifyId) {
        errors.verifyId = t("required");
      }
      return errors;
    },
  });

  const handleResendCode = () => {
    if (email.includes("@")) {
      resend(
        { email },
        {
          onSuccess: () => {
            timerReset();
            timerStart();
            success(t("verify.send"));
          },
          onError: (err: any) => {
            error(err.message);
          },
        },
      );
    } else {
      if (isUsingCustomPhoneSignIn) {
        authService
          .register({ phone: email })
          .then((res) => {
            onSuccess?.({
              ...res,
              email,
              verifyId: res.data?.verifyId,
            });
            timerReset();
            timerStart();
            success(t("verify.send"));
          })
          .catch(() => {
            error(t("sms.not.sent"));
          });
      } else {
        phoneNumberSignIn(email)
          .then((confirmationResult) => {
            timerReset();
            timerStart();
            success(t("verify.send"));
            if (setCallback) setCallback(confirmationResult);
          })
          .catch(() => error(t("sms.not.sent")));
      }
    }
  };

  useEffect(() => {
    timerStart();
  }, []);

  return (
    <form className={cls.wrapper} onSubmit={formik.handleSubmit}>
      <div className={cls.header}>
        <h1 className={cls.title}>
          {email.includes("@") ? t("verify.email") : t("verify.phone")}
        </h1>
        <p className={cls.text}>
          {t("verify.text")} <i>{email}</i>
        </p>
      </div>
      <div className={cls.space} />
      <Stack spacing={2}>
        <OtpInput
          numInputs={6}
          inputStyle={cls.input}
          isInputNum
          containerStyle={cls.otpContainer}
          value={formik.values.verifyId?.toString()}
          onChange={(otp: any) => formik.setFieldValue("verifyId", otp)}
        />
        <p className={cls.text}>
          {t("verify.didntRecieveCode")}{" "}
          {time === 0 ? (
            isResending ? (
              <span className={cls.text} style={{ opacity: 0.5 }}>
                Sending...
              </span>
            ) : (
              <span
                id="sign-in-button"
                onClick={handleResendCode}
                className={cls.resend}
              >
                {t("resend")}
              </span>
            )
          ) : (
            <span className={cls.text}>{time} s</span>
          )}
        </p>
      </Stack>
      <div className={cls.space} />
      <div className={cls.action}>
        <PrimaryButton
          type="submit"
          disabled={Number(formik?.values?.verifyId?.toString()?.length) < 6}
          loading={formik.isSubmitting}
        >
          {t("verify")}
        </PrimaryButton>
      </div>
    </form>
  );
}
