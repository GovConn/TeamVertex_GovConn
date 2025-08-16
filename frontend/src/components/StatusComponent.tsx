// import { Button } from "@/components/ui/button";

// const Accepted = ({ isRated }: { isRated: boolean }) => (
//   <div>
//     <div className="w-full bg-strokeSuccess rounded-3xl overflow-clip px-8 flex flex-col items-center justify-center gap-4 text-center min-h-44 md:min-h-52">
//       <h2 className="text-2xl font-medium text-textBlack">Accepted</h2>
//       <p className="text-textGrey text-sm md:text-base">
//         You can now come to the office. Be sure to not miss the appointed time
//       </p>
//     </div>

//     <div className="bg-bgDisabled rounded-xl border border-strokeGrey mt-8 flex flex-col justify-center w-full p-4">
//       <h2 className="font-medium text-lg text-textBlack">Instructions</h2>
//       <div className="space-y-2 min-h-24 flex flex-col w-full justify-start">
//         <p className="text-textGrey">None</p>
//       </div>
//     </div>

//     <div className="flex items-center justify-between mt-4 gap-4">
//       <Button
//         variant="secondary"
//         className="px-8 min-w-[120px] flex-1 sm:flex-none"
//         disabled={isRated}
//       >
//         Go Back
//       </Button>
//       <Button 
//         className="min-w-[120px] flex-1 sm:flex-none bg-mainYellow text-textBlack hover:bg-buttonPrimaryHover" 
//         disabled={isRated}
//       >
//         {!isRated ? "Rate Service" : "Rated"}
//       </Button>
//     </div>
//   </div>
// );

// const Reschedule = ({ isRated }: { isRated: boolean }) => (
//   <div>
//     <div className="w-full bg-mainYellow rounded-3xl overflow-clip px-8 flex flex-col items-center justify-center gap-4 text-center min-h-44 md:min-h-52">
//       <h2 className="text-2xl font-medium text-textBlack">Reschedule</h2>
//       <p className="text-textBlack opacity-80 text-sm md:text-base">
//         Due to unavoidable reasons, we have to move your appointment to new slot.
//       </p>
//     </div>

//     <div className="bg-bgDisabled rounded-xl border border-strokeGrey mt-8 flex flex-col justify-center w-full p-4">
//       <h2 className="font-medium text-lg text-textBlack">Instructions</h2>
//       <div className="space-y-2 min-h-24 flex flex-col w-full justify-start">
//         <div className="flex justify-between items-center">
//           <span className="text-sm text-textGrey">2025 - August - 25</span>
//           <span className="bg-strokeSuccess/20 text-strokeSuccess text-xs px-2 py-1 rounded">
//             not changed
//           </span>
//         </div>
//         <div className="flex justify-between items-center">
//           <span className="text-sm text-textGrey">10:15 AM - 10:30 AM</span>
//           <span className="bg-mainYellow/20 text-textBlack text-xs px-2 py-1 rounded">
//             changed
//           </span>
//         </div>
//         <div className="flex justify-between items-center">
//           <span className="text-sm text-textGrey">Accept before</span>
//           <span className="text-sm font-medium text-textBlack">XX : XX : XX</span>
//         </div>
//       </div>
//     </div>

//     <div className="flex items-center justify-between mt-4 gap-4">
//       <Button 
//         variant="secondary" 
//         className="px-8 min-w-[120px] flex-1 sm:flex-none"
//       >
//         Go Back
//       </Button>
//       <Button className="px-8 bg-strokeSuccess hover:bg-strokeSuccess/80 min-w-[120px] flex-1 sm:flex-none text-textWhite">
//         Accept
//       </Button>
//     </div>
//   </div>
// );

// const Rejected = ({ isRated }: { isRated: boolean }) => (
//   <div>
//     <div className="w-full bg-strokeError rounded-3xl overflow-clip px-8 flex flex-col items-center justify-center gap-4 text-center min-h-44 md:min-h-52">
//       <h2 className="text-2xl font-medium text-textWhite">Rejected</h2>
//       <p className="text-textWhite opacity-90 text-sm md:text-base">
//         Your appointment has been rejected.
//       </p>
//     </div>

//     <div className="bg-bgDisabled rounded-xl border border-strokeGrey mt-8 flex flex-col justify-center w-full p-4">
//       <h2 className="font-medium text-lg text-textBlack">Instructions</h2>
//       <div className="space-y-2 min-h-24 flex flex-col w-full justify-start">
//         <p className="text-textGrey">Reason from the office</p>
//       </div>
//     </div>

//     <div className="flex items-center justify-between mt-4 gap-4">
//       <Button 
//         variant="secondary" 
//         className="px-8 min-w-[120px] flex-1 sm:flex-none"
//       >
//         Re-apply
//       </Button>
//       <Button 
//         className="min-w-[120px] flex-1 sm:flex-none bg-mainYellow text-textBlack hover:bg-buttonPrimaryHover" 
//         disabled={isRated}
//       >
//         {!isRated ? "Rate Service" : "Rated"}
//       </Button>
//     </div>
//   </div>
// );

// const Pending = ({ isRated }: { isRated: boolean }) => (
//   <div>
//     <div className="w-full bg-bgDisabled rounded-3xl overflow-clip px-8 flex flex-col items-center justify-center gap-4 text-center min-h-44 md:min-h-52">
//       <h2 className="text-2xl font-medium text-textBlack">Pending</h2>
//       <p className="text-textGrey text-sm md:text-base">
//         Your request is still being processed
//       </p>
//     </div>

//     <div className="bg-bgDisabled rounded-xl border border-strokeGrey mt-8 flex flex-col justify-center w-full p-4">
//       <h2 className="font-medium text-lg text-textBlack">Instructions</h2>
//       <div className="space-y-2 min-h-24 flex flex-col w-full justify-start">
//         <p className="text-textGrey">None</p>
//       </div>
//     </div>

//     <div className="flex items-center justify-between mt-4 gap-4">
//       {!isRated ? (
//         <Button 
//           variant="secondary" 
//           className="px-8 min-w-[120px] flex-1 sm:flex-none"
//         >
//           Go Back
//         </Button>
//       ) : (
//         <Button className="px-8 min-w-[120px] flex-1 sm:flex-none bg-strokeError hover:bg-strokeError/80 text-textWhite">
//           Cancel
//         </Button>
//       )}
//       <Button 
//         className="min-w-[120px] flex-1 sm:flex-none bg-mainYellow text-textBlack hover:bg-buttonPrimaryHover" 
//         disabled={isRated}
//       >
//         {!isRated ? "Rate Service" : "Rated"}
//       </Button>
//     </div>
//   </div>
// );

// const StatusComponent = ({
//   status,
//   isRated,
// }: {
//   status?: string;
//   isRated: boolean;
// }) => {
//   switch (status) {
//     case "accepted":
//       return <Accepted isRated={isRated} />;
//     case "reschedule":
//       return <Reschedule isRated={isRated} />;
//     case "rejected":
//       return <Rejected isRated={isRated} />;
//     case "pending":
//       return <Pending isRated={isRated} />;
//     default:
//       return <Pending isRated={isRated} />;
//   }
// };

// export default StatusComponent;
