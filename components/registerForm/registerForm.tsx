import React from "react";
import cls from "./registerForm.module.scss";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import TextInput from "components/inputs/textInput";
import PrimaryButton from "components/button/primaryButton";
import { useFormik } from "formik";
import authService from "services/auth";
import { error } from "components/alert/toast";
import { useAuth } from "contexts/auth/auth.context";
import MailLineIcon from "remixicon-react/MailLineIcon";
import PhoneLineIcon from "remixicon-react/PhoneLineIcon";
import { TabSwitch } from "../tabSwitch/tabSwitch";
import { PhoneNumberInput } from "../phoneNumberInput/phoneNumberInput";

type RegisterViews = "REGISTER" | "VERIFY" | "COMPLETE";
type Props = {
  onSuccess: (data: any) => void;
  changeView: (view: RegisterViews) => void;
};

interface formValues {
  type: "email" | "phone";
  email?: string;
  phone?: string;
}

const tabs = [
  {
    value: "email",
    icon: <MailLineIcon />,
  },
  {
    value: "phone",
    icon: <PhoneLineIcon />,
  },
];

export default function RegisterForm({ onSuccess, changeView }: Props) {
  const { t } = useTranslation();
  const { phoneNumberSignIn } = useAuth();

  const isUsingCustomPhoneSignIn =
    process.env.NEXT_PUBLIC_CUSTOM_PHONE_SINGUP === "true";

  const formik = useFormik({
    initialValues: {
      type: "email",
      email: "",
      phone: "",
    },
    onSubmit: (values: formValues, { setSubmitting }) => {
      if (values.type === "email") {
        authService
          .register({ email: values.email })
          .then((res) => {
            onSuccess({ ...res, email: values.email });
            changeView("VERIFY");
          })
          .catch(() => {
            error(t("email.inuse"));
          })
          .finally(() => {
            setSubmitting(false);
          });
      } else {
        if (isUsingCustomPhoneSignIn) {
          authService
            .register({ phone: values.phone })
            .then((res) => {
              onSuccess({
                ...res,
                email: values.phone,
                verifyId: res.data?.verifyId,
              });
              changeView("VERIFY");
            })
            .catch(() => {
              error(t("phone.number.inuse"));
            })
            .finally(() => {
              setSubmitting(false);
            });
        } else {
          phoneNumberSignIn(values.phone as string)
            .then((confirmationResult) => {
              onSuccess({
                email: values.phone,
                callback: confirmationResult,
              });
              changeView("VERIFY");
            })
            .catch(() => {
              error(t("sms.not.sent"));
            })
            .finally(() => {
              setSubmitting(false);
            });
        }
      }
    },

    validate: (values: formValues) => {
      const errors = {} as formValues;
      if (values.type === "email") {
        if (!values.email) {
          errors.email = t("required");
        } else if (
          values.email?.includes("@") &&
          !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)
        ) {
          errors.email = t("email.should.be.valid");
        } else if (values.email?.includes(" ")) {
          errors.email = t("should.not.includes.empty.space");
        }
      } else {
        if (!values.phone) {
          errors.phone = t("required");
        }
      }
      return errors;
    },
  });

  return (
    <form className={cls.wrapper} onSubmit={formik.handleSubmit}>
      <div className={cls.header}>
        <h1 className={cls.title}>{t("sign.up")}</h1>
        <p className={cls.text}>
          {t("have.account")} <Link href="/login">{t("login")}</Link>
        </p>
      </div>
      <div className={cls.space} />
      <TabSwitch
        tabs={tabs}
        selectedTab={formik.values.type}
        setSelectedTab={(type) => formik.setFieldValue("type", type)}
      />
      <div className={cls.space} />
      {formik.values.type === "email" ? (
        <TextInput
          name="email"
          label={t("email")}
          placeholder={t("type.here")}
          value={formik.values.email}
          onChange={formik.handleChange}
          error={!!formik.errors.email && formik.touched.email}
        />
      ) : (
        <div className={cls.phone}>
          <label htmlFor="phone" className={cls.label}>
            {t("phone")}
          </label>
          <PhoneNumberInput
            name="phone"
            value={formik.values.phone || ""}
            onChange={(phone) => formik.setFieldValue("phone", phone)}
          />
        </div>
      )}
      <div className={cls.space} />
      <div className={cls.action}>
        <PrimaryButton
          id="sign-in-button"
          type="submit"
          loading={formik.isSubmitting}
        >
          {t("sign.up")}
        </PrimaryButton>
      </div>
    </form>
  );
}