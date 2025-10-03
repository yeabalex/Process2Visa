import mongoosePromise from "@/db/db.config";
import Purchase from "@/db/purchaseModel";
import Service from "@/db/serviceModel";
import Steps from "@/db/stepsSchema";
import Country from "@/db/countryModel";
import Otp from "@/db/otpModel";
import PhoneToChat from "@/db/phoneToChatModel";
import { ItemsCompleted } from "@/db/itemsCompletedModel";
import { User, UserCourses, Course, UserProgress, CompletedItems } from "@/db/userModel";
import SupportTicket from "@/db/supportTicketModel";

// Ensure the connection is initialized when models are imported
void mongoosePromise;

export {
  Purchase,
  Service,
  Steps,
  Country,
  Otp,
  PhoneToChat,
  ItemsCompleted,
  User,
  UserCourses,
  Course,
  UserProgress,
  CompletedItems,
  SupportTicket,
};


