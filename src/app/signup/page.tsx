
'use client';

import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import Link from 'next/link';
import {useToast} from '@/hooks/use-toast';
import {useRouter} from 'next/navigation';
import {Loader2, ArrowLeft, ArrowRight, Info} from 'lucide-react';
import {app} from '@/lib/firebase';
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from 'firebase/auth';
import {getFirestore, doc, setDoc, serverTimestamp} from 'firebase/firestore';
import {RadioGroup, RadioGroupItem} from '@/components/ui/radio-group';
import {Progress} from '@/components/ui/progress';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {motion, AnimatePresence} from 'framer-motion';

const auth = getAuth(app);
const db = getFirestore(app);

const individualSteps = [
  {
    field: 'role',
    title: 'Select Account Type',
    description: 'Are you an individual or representing an MSME?',
  },
  {
    field: 'displayName',
    title: 'What is your name?',
    description: 'This will be used to personalize your experience.',
  },
  {
    field: 'email',
    title: 'Enter your email',
    description: 'This will be your login username.',
  },
  {
    field: 'password',
    title: 'Create a password',
    description: 'Must be at least 6 characters long.',
  },
];

const msmeSteps = [
  ...individualSteps.slice(0, 4),
  {
    field: 'msmeName',
    title: 'What is your MSME Name?',
    description: 'Your official business or brand name.',
  },
  {
    field: 'msmeService',
    title: 'What service/product do you offer?',
    description: 'A brief description of what your business does.',
  },
  {
    field: 'msmeLocation',
    title: 'Where is your business located?',
    description: 'e.g., Pune, Maharashtra',
  },
  {
    field: 'ownerContact',
    title: 'What is your contact number?',
    description: 'This will be shared with potential clients.',
  },
  {
    field: 'msmeWebsite',
    title: 'What is your business website?',
    description: "Enter your URL. If you don't have one, we can help!",
  },
];

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    role: 'individual' as 'individual' | 'msme',
    displayName: '',
    email: '',
    password: '',
    msmeName: '',
    msmeService: '',
    msmeLocation: '',
    ownerContact: '',
    msmeWebsite: '',
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [direction, setDirection] = useState(1);
  const {toast} = useToast();
  const router = useRouter();

  const steps = formData.role === 'msme' ? msmeSteps : individualSteps;
  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / (steps.length + 1)) * 100;

  const handleNext = () => {
    // Validation
    const currentField = currentStepData.field as keyof typeof formData;
    if (!formData[currentField]) {
      toast({variant: 'destructive', description: 'Please fill in the field.'});
      return;
    }
    if (currentField === 'password' && formData.password.length < 6) {
      toast({
        variant: 'destructive',
        description: 'Password must be at least 6 characters.',
      });
      return;
    }

    if (currentStep < steps.length - 1) {
      setDirection(1);
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(currentStep - 1);
    }
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({...prev, [field]: value}));
  };

  const handleSignUp = async () => {
    const finalField = currentStepData.field as keyof typeof formData;
    if (!formData[finalField]) {
      toast({
        variant: 'destructive',
        description: 'Please fill in the final field.',
      });
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;
      await updateProfile(user, {displayName: formData.displayName});

      // Send verification email
      await sendEmailVerification(user);

      // Create a user profile document in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const profileData: any = {
        uid: user.uid,
        displayName: formData.displayName,
        email: user.email,
        role: formData.role,
        createdAt: serverTimestamp(),
      };

      if (formData.role === 'msme') {
        profileData.msmeName = formData.msmeName;
        profileData.msmeService = formData.msmeService;
        profileData.msmeLocation = formData.msmeLocation;
        profileData.ownerContact = formData.ownerContact;
        profileData.msmeWebsite = formData.msmeWebsite;
      }

      await setDoc(userDocRef, profileData);

      toast({
        title: 'Account Created',
        description:
          'Welcome! A verification email has been sent. Please check your inbox.',
      });

      // The AuthProvider will handle redirection.
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Sign Up Failed',
        description: error.message || 'An unexpected error occurred.',
      });
      setIsLoading(false);
    }
  };

  const renderInput = () => {
    switch (currentStepData.field) {
      case 'role':
        return (
          <RadioGroup
            defaultValue={formData.role}
            onValueChange={(value: 'individual' | 'msme') =>
              handleChange('role', value)
            }
            className="flex gap-4 pt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="individual" id="individual" />
              <Label htmlFor="individual" className="text-base">
                Individual
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="msme" id="msme" />
              <Label htmlFor="msme" className="text-base">
                MSME
              </Label>
            </div>
          </RadioGroup>
        );
      case 'password':
        return (
          <Input
            id={currentStepData.field}
            type="password"
            value={formData[currentStepData.field as keyof typeof formData]}
            onChange={e =>
              handleChange(
                currentStepData.field as keyof typeof formData,
                e.target.value
              )
            }
          />
        );
      case 'msmeWebsite':
        return (
          <div className="space-y-4">
            <Input
              id={currentStepData.field}
              value={formData[currentStepData.field as keyof typeof formData]}
              onChange={e =>
                handleChange(
                  currentStepData.field as keyof typeof formData,
                  e.target.value
                )
              }
              placeholder="e.g., www.mybusiness.com"
            />
            <div className="flex items-start gap-2 p-3 rounded-md bg-blue-50 border border-blue-200 text-blue-800">
              <Info className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <p className="text-xs">
                No website? No problem! Create a professional one easily with{' '}
                <a
                  href="https://www.zoho.com/sites/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline"
                >
                  Zoho Sites
                </a>
                . It's a great way to build credibility.
              </p>
            </div>
          </div>
        );
      default:
        return (
          <Input
            id={currentStepData.field}
            value={formData[currentStepData.field as keyof typeof formData]}
            onChange={e =>
              handleChange(
                currentStepData.field as keyof typeof formData,
                e.target.value
              )
            }
          />
        );
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 30 : -30,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 30 : -30,
      opacity: 0,
    }),
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center mb-6">
          <div className="mb-4 flex justify-center">
            <svg
              width="48"
              height="48"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-primary"
            >
              <path
                d="M32 58.6667C46.7276 58.6667 58.6667 46.7276 58.6667 32C58.6667 17.2724 46.7276 5.33334 32 5.33334C17.2724 5.33334 5.33334 17.2724 5.33334 32C5.33334 46.7276 17.2724 58.6667 32 58.6667Z"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinejoin="round"
              />
              <path
                d="M21.3333 42.6667C21.3333 42.6667 24 34.6667 32 34.6667C40 34.6667 42.6667 42.6667 42.6667 42.6667"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M40 26.6667C40 28.8758 38.2091 30.6667 36 30.6667C33.7909 30.6667 32 28.8758 32 26.6667C32 24.4576 33.7909 22.6667 36 22.6667C38.2091 22.6667 40 24.4576 40 26.6667Z"
                fill="currentColor"
              />
              <path
                d="M28 26.6667C28 28.8758 26.2091 30.6667 24 30.6667C21.7909 30.6667 20 28.8758 20 26.6667C20 24.4576 21.7909 22.6667 24 22.6667C26.2091 22.6667 28 24.4576 28 26.6667Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold">Create an Account</h1>
        </div>

        <Card className="overflow-hidden">
          <Progress
            value={progress}
            className="w-full h-1 rounded-none bg-primary/20 [&>div]:bg-primary"
          />
          <div className="relative h-64">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: {type: 'spring', stiffness: 300, damping: 30},
                  opacity: {duration: 0.2},
                }}
                className="absolute w-full"
              >
                <CardHeader>
                  <CardTitle>{currentStepData.title}</CardTitle>
                  <CardDescription>{currentStepData.description}</CardDescription>
                </CardHeader>
                <CardContent>{renderInput()}</CardContent>
              </motion.div>
            </AnimatePresence>
          </div>
          <CardFooter className="flex justify-between border-t pt-4">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 0 || isLoading}
            >
              <ArrowLeft className="mr-2" />
              Back
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button onClick={handleNext}>
                Next <ArrowRight className="ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSignUp} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </Button>
            )}
          </CardFooter>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="underline hover:text-primary">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
