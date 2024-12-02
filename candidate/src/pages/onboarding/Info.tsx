import { DatePicker, Input, Radio, RadioGroup } from "@nextui-org/react";
import { CalendarDate, today } from "@internationalized/date";

const Info = ({
  name,
  setName,
  dob,
  setDob,
  gender,
  setGender,
}: {
  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
  dob: CalendarDate | undefined;
  setDob: React.Dispatch<React.SetStateAction<CalendarDate | undefined>>;
  gender: string;
  setGender: React.Dispatch<React.SetStateAction<string>>;
}) => {
  return (
    <div className="pt-16">
      <h2>
        Welcome to Scriptopia Candidate. <br /> Let's get you started.
      </h2>
      <p className="opacity-50 mt-1">First, tell us about yourself.</p>

      <div className="mt-5 w-[500px]">
        <Input
          label="Your Full Name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <DatePicker
          label="Date of Birth"
          className="mt-3"
          value={dob}
          onChange={(date) => setDob(date)}
          maxValue={today("IST")}
        />

        <RadioGroup
          label="Gender"
          orientation="horizontal"
          className="mt-3"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
        >
          <Radio value="male">Male</Radio>
          <Radio value="female">Female</Radio>
          <Radio value="other">Other</Radio>
        </RadioGroup>
      </div>
    </div>
  );
};

export default Info;