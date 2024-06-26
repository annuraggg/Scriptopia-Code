import Problem from "@/schemas/ProblemSchema.js";
import Screening from "@/schemas/ScreeningSchema.js";
import ScreeningSubmission from "@/schemas/screeningSubmissionsSchema.js";
import express from "express";
const router = express.Router();

router.post("/", async (req, res) => {
  const { screeningId } = req.body;
  console.log(screeningId);

  const candidate = await ScreeningSubmission.findOne({ screeningId });
  const screening = await Screening.findOne({ _id: screeningId });

  if (!candidate) {
    return res.status(404).json({ message: "No submissions found" });
  }

  if (!screening) {
    return res.status(404).json({ message: "No screening found" });
  }

  let totalScore = 0;
  const average = 0;

  let windowSwitch = 0;
  candidate.submission.forEach((s) => {
    if (!s.submission) return;
    windowSwitch += s.submission.tabChange;
  });

  let pastedCode = 0;
  candidate.submission.forEach((s) => {
    if (!s.submission) return;
    pastedCode += s.submission.paste;
  });

  const challengeArr = [];
  for (const submission of candidate.submission) {
    const challenge = await Problem.findOne({ _id: submission.problemId });

    if (!challenge) {
      return res.status(404).json({ message: "No challenge found" });
    }

    const challengeObj = {
      id: challenge?._id,
      name: challenge?.title,
      timeTaken: submission.submission.totalTime,
      difficulty: challenge?.difficulty,
      status: submission.result.status,
      language: submission.result.language,
      cheating: {
        detected:
          submission.submission.paste + submission.submission.tabChange > 2,
        pastedCode: submission.submission.paste,
        windowSwitch: submission.submission.tabChange,
      },
      score: 0,
    };

    console.log(challengeObj);
    challengeArr.push(challengeObj);
  }

  const languages: string[] = [];
  candidate.submission.forEach((s) => {
    if (!languages.includes(s.result.language)) {
      languages.push(s.result.language);
    }
  });

  const skillRating: {
    [key: string]: {
      score: number;
      outOf: number;
      outOfHundred: number;
    };
  } = {};
  languages.forEach((lang) => {
    let score = 0;
    let outOf = 0;
    candidate.submission.forEach((s) => {
      if (s.result.language === lang) {
        outOf++;
      }

      if (s.result.internalStatus == "PASSED" && s.result.language === lang) {
        score++;
      }
    });

    skillRating[lang] = {
      score: score,
      outOf: outOf,
      outOfHundred: (score / outOf) * 100,
    };
  });

  const cumulativeScore = Object.values(skillRating).reduce(
    (acc, curr) => acc + curr.score,
    0
  );

  const cumulativeOutOf = Object.values(skillRating).reduce(
    (acc, curr) => acc + curr.outOf,
    0
  );

  const cumulativeOutOfHundred = (cumulativeScore / cumulativeOutOf) * 100;
  totalScore = cumulativeOutOfHundred;

  const resObj = {
    id: candidate._id,
    name: candidate.userName,
    email: candidate.userEmail,
    assessmentDate: candidate.createdAt,
    sessionRewind: candidate.sessionUrl,
    scores: {
      average: average,
      qualifying: screening.qualifyingScore,
      total: totalScore,
    },
    cheating: {
      detected: pastedCode + windowSwitch > 2,
      pastedCode: pastedCode,
      windowSwitch: windowSwitch,
    },
    skillRating: skillRating,
    challengeSolution: challengeArr,
  };

  return res.status(200).json(resObj);
});

export default router;

/*
FORMAT
    const data: CandidateReport = {
      name: "Anurag Sawant",
      email: "anuragsawant@duck.com",
      assessmentDate: "2021-09-01",
      sessionRewind: "https://www.youtube.com/watch?v=9bZkp7q19f0",
      scores: {
        average: 80,
        qualifying: 70,
        total: 100,
      },
      cheating: {
        detected: true,
        pastedCode: true,
        windowSwitch: true,
      },
      skillRating: {
        javascript: {
          score: 80,
          outOf: 100,
        },
        react: {
          score: 70,
          outOf: 100,
        },
        nodejs: {
          score: 90,
          outOf: 100,
        },
        typescript: {
          score: 85,
          outOf: 100,
        },
      },
      challengeSolution: [
        {
          id: 1,
          name: "Two Sum",
          timeTaken: 10,
          difficulty: "Easy",
          status: "Accepted",
          language: "Javascript",
          cheating: {
            detected: false,
            pastedCode: 2,
            windowSwitch: 4,
          },
          score: 100,
        },
        {
          id: 2,
          name: "Add Two Numbers",
          timeTaken: 15,
          difficulty: "Medium",
          status: "Accepted",
          language: "Javascript",
          cheating: {
            detected: false,
            pastedCode: 10,
            windowSwitch: 12,
          },
          score: 100,
        },
        {
          id: 3,
          name: "Longest Substring Without Repeating Characters",
          timeTaken: 20,
          difficulty: "Hard",
          status: "Accepted",
          language: "Javascript",
          cheating: {
            detected: false,
            pastedCode: 2,
            windowSwitch: 0,
          },
          score: 100,
        },
        {
          id: 4,
          name: "Median of Two Sorted Arrays",
          timeTaken: 25,
          difficulty: "Hard",
          status: "Accepted",
          language: "Javascript",
          cheating: {
            detected: false,
            pastedCode: 25,
            windowSwitch: 12,
          },
          score: 100,
        },
        {
          id: 5,
          name: "Longest Palindromic Substring",
          timeTaken: 30,
          difficulty: "Hard",
          status: "Accepted",
          language: "Javascript",
          cheating: {
            detected: true,
            pastedCode: 4,
            windowSwitch: 0,
          },
          score: 100,
        },
      ],
    };
*/
