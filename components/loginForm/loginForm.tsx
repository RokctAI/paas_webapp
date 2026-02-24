import React from "react";
import cls from "./loginForm.module.scss";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import TextInput from "components/inputs/textInput";
import CheckboxInput from "components/inputs/checkboxInput";
import PrimaryButton from "components/button/primaryButton";
import PasswordInput from "components/inputs/passwordInput";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import authService from "services/auth";
import { error } from "components/alert/toast";
import { useAuth } from "contexts/auth/auth.context";
import { setCookie } from "utils/session";
import { LoginCredentials } from "interfaces/user.interface";
import { Stack } from "@mui/material";
import { defaultUser } from "constants/config";
import { TabSwitch } from "../tabSwitch/tabSwitch";
import MailLineIcon from "remixicon-react/MailLineIcon";
import PhoneLineIcon from "remixicon-react/PhoneLineIcon";
import { PhoneNumberInput } from "../phoneNumberInput/phoneNumberInput";

type Props = {};
interface formValues {
  type: "email" | "phone";
  email?: string;
  phone?: string;
  password: string;
  login?: string;
  keep_logged?: boolean;
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

export default function LoginForm({}: Props) {
  const { t } = useTranslation();
  const { push } = useRouter();
  const { setUserData } = useAuth();

  const formik = useFormik({
    initialValues: {
      type: "email",
      email: "",
      phone: "",
      login: "",
      password: "",
      keep_logged: true,
    },
    onSubmit: (values: formValues, { setSubmitting }) => {
      let body: LoginCredentials;
      if (values.type === "email") {
        body = {
          email: values.email,
          password: values.password,
        };
      } else {
        const trimmedPhone = values.phone?.replace(/[^0-9]/g, "");
        body = {
          phone: Number(trimmedPhone),
          password: values.password,
        };
      }
      authService
        .login(body)
        .then(({ data }) => {
          const token = data.token_type + " " + data.access_token;
          setCookie("access_token", token);
          setUserData(data.user);
          push("/");
        })
        .catch(() => error(t("login.invalid")))
        .finally(() => setSubmitting(false));
    },
    validate: (values: formValues) => {
      const errors: formValues = {} as formValues;
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
      }
      if (!values.password) {
        errors.password = "Required";
      }
      return errors;
    },
  });

  const handleCopy = (email: string, password: string) => {
    formik.setValues({ type: "email", email, password, keep_logged: true });
  };

  return (
    <form className={cls.wrapper} onSubmit={formik.handleSubmit}>
      <div className={cls.header}>
        <h1 className={cls.title}>{t("login")}</h1>
        <p className={cls.text}>
          {t("dont.have.account")} <Link href="/register">{t("sign.up")}</Link>
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
      <PasswordInput
        name="password"
        label={t("password")}
        placeholder={t("type.here")}
        value={formik.values.password}
        onChange={formik.handleChange}
        error={!!formik.errors.password && formik.touched.login}
      />
      <div className={cls.flex}>
        <div className={cls.item}>
          <CheckboxInput
            id="keep_logged"
            name="keep_logged"
            checked={formik.values.keep_logged}
            onChange={formik.handleChange}
          />
          <label htmlFor="keep_logged" className={cls.label}>
            {t("keep.logged")}
          </label>
        </div>
        <div className={cls.item}>
          <Link href="/reset-password">{t("forgot.password")}</Link>
        </div>
      </div>
      <div className={cls.space} />
      <div className={cls.action}>
        <PrimaryButton type="submit" loading={formik.isSubmitting}>
          {t("login")}
        </PrimaryButton>
      </div>
      {process.env.NEXT_PUBLIC_IS_DEMO_APP === "true" && (
        <div className={cls.userInfo}>
          <Stack>
            <span className={cls.login}>{defaultUser.login}</span>
            <span className={cls.password}>{defaultUser.password}</span>
          </Stack>
          <button
            onClick={() => handleCopy(defaultUser.login, defaultUser.password)}
            type={"button"}
            className={cls.copy}
          >
            {t("copy")}
          </button>
        </div>
      )}
    </form>
  );
}
