import { Fragment, useEffect, useState } from "react";
import Button from "../button/Button";
import { BarLoader, PulseLoader } from "react-spinners";
import { CheckEmail, FetchData, GetEncrypt } from "app/lib/helper";
import { json } from "zod";
import { toast } from "react-toastify";

interface GetInTouchFormProps {
  isAfterBannerPage?: boolean;
  dataApi?: any;
}

const GetInTouchForm = (props: GetInTouchFormProps) => {
  var keyAllow = ["ArrowLeft", "ArrowRight", "Backspace", "Delete"];

  const [sectionData, setSectionData] = useState({
    name: "Fill Up The Form ",
    description:
      "Your email address will not be published. Required fields are marked *",
  });

  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDisableSubmit, setIsDisableSubmit] = useState(true);

  const [inputForm, setInputForm] = useState({
    name: "",
    phone: "",
    email: "",
    location: "",
    messages: "",
    ip: "-",
  });

  const onSubmit = async () => {
    setIsLoading(true);
    try {
      const url = "api/fe/v1/getintouch";

      const data = await FetchData(
        url,
        "POST",
        GetEncrypt(JSON.stringify(inputForm)),
        false,
        "",
        false
      );

      if (data?.code == 200) {
        setIsSuccess(true);
      } else {
        setErrorMessage("Something wrong! Please Try Again ");
      }
    } catch (e) {
      setErrorMessage("Something wrong! Please Try Again ");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    var disableBtn = false;
    if (
      inputForm.name == null ||
      inputForm.name == undefined ||
      inputForm.name?.trim() == ""
    ) {
      disableBtn = true;
    }
    if (
      inputForm.phone == null ||
      inputForm.phone == undefined ||
      inputForm.phone?.trim() == ""
    ) {
      disableBtn = true;
    }

    if (
      inputForm.email == null ||
      inputForm.email == undefined ||
      inputForm.email?.trim() == "" ||
      CheckEmail(inputForm.email) == null ||
      CheckEmail(inputForm.email) == undefined
    ) {
      disableBtn = true;
    }

    if (
      inputForm.location == null ||
      inputForm.location == undefined ||
      inputForm.location?.trim() == ""
    ) {
      disableBtn = true;
    }

    if (
      inputForm.messages == null ||
      inputForm.messages == undefined ||
      inputForm.messages?.trim() == ""
    ) {
      disableBtn = true;
    }

    setIsDisableSubmit(disableBtn);
  }, [inputForm]);

  return (
    <div
      className={`bg-[#D9D9D94D] ${
        props.isAfterBannerPage == true ? "pt-[20px]" : ""
      }`}
    >
      <div className="px-8 py-4 gap-4 lg:py-8 lg:px-16 lg:gap-16 flex flex-col">
        {isSuccess ? (
          <div>
            Thank You for Reaching Out! <br /> ‍We appreciate you taking the
            time to connect with us. <br /> Your submission has been
            successfully received. <br /> Our team is reviewing your request,
            and we'll get back to you as soon as possible.
          </div>
        ) : (
          <Fragment>
            <div className="text-center flex flex-col gap-2">
              <h2 className="ebd-text-gradient text-[20px] lg:text-[32px] lg:leading-[34px] font-[800]">
                {props?.dataApi?.title}
              </h2>
              <div
                className="text-[16px] lg:text-[18px] lg:leading-[20px]"
                dangerouslySetInnerHTML={{ __html: props?.dataApi?.subTitle }}
              ></div>
            </div>
            <div className="flex flex-col gap-6">
              {errorMessage !== "" ? (
                <div
                  className="flex items-center p-4 mb-4 text-sm text-red-700 bg-red-100 border border-red-400 rounded-lg"
                  role="alert"
                >
                  {errorMessage}
                </div>
              ) : null}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-16">
                <div className="lg:col-span-4 flex flex-col gap-4">
                  <div>
                    <input
                      type="text"
                      value={inputForm.name}
                      onChange={(e) =>
                        setInputForm((current) => ({
                          ...current,
                          ...{ name: e.target.value },
                        }))
                      }
                      placeholder="Name*"
                      className="w-full p-2 px-4 rounded"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      placeholder="Phone / Whatsapp*"
                      value={inputForm.phone}
                      minLength={9}
                      maxLength={14}
                      className="w-full p-2 px-4 rounded"
                      onChange={(e) =>
                        setInputForm((current) => ({
                          ...current,
                          ...{ phone: e.target.value },
                        }))
                      }
                      onKeyDown={(event) => {
                        if (event.ctrlKey == false) {
                          if (
                            !/[0-9]/.test(event.key) &&
                            !keyAllow.includes(event.key)
                          ) {
                            event.preventDefault();
                          }
                        }
                      }}
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      value={inputForm.email}
                      placeholder="Email*"
                      onChange={(e) =>
                        setInputForm((current) => ({
                          ...current,
                          ...{ email: e.target.value },
                        }))
                      }
                      className="w-full p-2 px-4 rounded"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={inputForm.location}
                      onChange={(e) =>
                        setInputForm((current) => ({
                          ...current,
                          ...{ location: e.target.value },
                        }))
                      }
                      placeholder="Address*"
                      className="w-full p-2 px-4 rounded"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="lg:col-span-8">
                  <textarea
                    value={inputForm.messages}
                    onChange={(e) =>
                      setInputForm((current) => ({
                        ...current,
                        ...{ messages: e.target.value },
                      }))
                    }
                    placeholder="Text Messages"
                    className="w-full h-full p-2 px-4 rounded"
                    disabled={isLoading}
                  ></textarea>
                </div>
              </div>
              <div className="self-end">
                {isLoading ? (
                  <PulseLoader />
                ) : (
                  <Button
                    disabled={isDisableSubmit}
                    onClick={() => onSubmit()}
                    name="Submit"
                  />
                )}
              </div>
            </div>
          </Fragment>
        )}
      </div>
    </div>
  );
};

export default GetInTouchForm;
