import React, { useState } from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Paper
} from "@mui/material";
import {
  ExpandMore,
  School,
  TrendingUp,
  AccountBalance,
  ShoppingCart,
  Info,
  CheckCircle,
  Warning,
  Lightbulb
} from "@mui/icons-material";

const BeginnerGuide = () => {
  const [activeStep, setActiveStep] = u