"""
Universal Operational Bottleneck Diagnostic System
Generates immediate 3-page PDF reports from intake questionnaire data

UPDATED: Now routes Track A vs Track B and uses inference-based calculations
- Track A: Decision-heavy/Founder-led → Opportunity cost calculation
- Track B: Time-bound/Standardized → Operational cost calculation (turnover, idle, leakage, growth blocked)

USAGE:
1. Collect intake responses (web form, paper, interview)
2. Create response dictionary with answers
3. Run: diagnostic = BottleneckDiagnostic(responses)
4. Run: diagnostic.generate_pdf_report(client_name, client_email, output_filename)

DEPENDENCIES:
pip install reportlab

Author: Afterload
Date: 2025
"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from datetime import datetime


# ============================================================================
# PART 1: DIAGNOSTIC ENGINE
# ============================================================================

class BottleneckDiagnostic:
    """
    Analyzes intake questionnaire responses to identify operational bottlenecks
    Routes between Track A (cognitive/opportunity cost) and Track B (operational cost)
    """
    
    # Time waste estimates (min hours, max hours per week)
    TIME_WASTE_MAP = {
        "Scheduling and rebooking": (6, 10),
        "Chasing payments/invoicing": (5, 8),
        "Answering the same questions over and over": (5, 8),
        "Fixing mistakes or redoing work": (10, 15),
        "Managing team drama or performance": (8, 12),
        "Supply/inventory management": (6, 10),
        "Redoing or fixing work": (10, 15),
        "Being interrupted constantly": (8, 12),
        "Dealing with unhappy customers": (8, 12),
        "Scheduling, billing, or administrative": (6, 10),
        "Doing the actual service/work myself": (20, 30),
        "Training new people": (10, 15)
    }
    
    # Bottleneck pattern definitions
    BOTTLENECK_PATTERNS = {
        "founder_single_point_of_failure": {
            "name": "Founder Single Point of Failure",
            "triggers": [
                "Everything stops",
                "Revenue drops immediately",
                "All of it - I am the service",
                "Me personally - not enough of me"
            ],
            "description": "Your personal availability is the revenue ceiling. When you're absent, business stops.",
            "symptoms": [
                "Revenue drops when you're not working",
                "Team can't operate without you present",
                "You are the service delivery mechanism"
            ]
        },
        
        "tribal_knowledge": {
            "name": "Tribal Knowledge",
            "triggers": [
                "It's all in my head",
                "They'd have to ask me everything",
                "No - it's in my head and changes every time"
            ],
            "description": "All processes in founder head. No documentation exists. Team has no reference system.",
            "symptoms": [
                "Team interrupts you constantly with 'quick questions'",
                "New hires take 6+ months to be productive",
                "If you're sick, operations grind to a halt"
            ]
        },
        
        "documentation_bypassed": {
            "name": "Documentation Bypassed",
            "triggers": [
                "I hand out yearly meeting paperwork",
                "I have notes everywhere for reference",
                "Rarely - they ask me instead",
                "No - they ignore it and ask me every time"
            ],
            "description": "Documentation exists but team asks you instead. Format/accessibility mismatch, not knowledge gap.",
            "symptoms": [
                "Team ignores written docs and asks you directly",
                "You hand out materials but they're not referenced",
                "Format doesn't match how team actually learns"
            ]
        },
        
        "documentation_fragmentation": {
            "name": "Documentation Fragmentation",
            "triggers": [
                "I have notes everywhere for reference",
                "It's mostly written somewhere, but some is in my head",
                "Sometimes - when reminded"
            ],
            "description": "Information scattered across multiple places. Hard to find what you need when you need it.",
            "symptoms": [
                "Documentation exists but is disorganized",
                "Team needs reminders to check docs",
                "Multiple systems with overlapping info"
            ]
        },
        
        "documentation_culture_gap": {
            "name": "Documentation Culture Gap",
            "triggers": [
                "Centralized system (Notion, Confluence, intranet)",
                "No - they ignore it and ask me every time",
                "Rarely - they ask me instead"
            ],
            "description": "Good system exists but team hasn't adopted the habit. Cultural/training issue, not technical.",
            "symptoms": [
                "Centralized docs exist but unused",
                "Team bypasses system to ask you",
                "Adoption problem, not documentation problem"
            ]
        },
        
        "decision_overload": {
            "name": "Decision Overload",
            "triggers": [
                "10+ things",
                "Lost count - it's constant",
                "Fried - brain is mush",
                "Drained - lots of tiny decisions",
                "Non-stop - I never finish a thought",
                "Constantly - I'm the bottleneck"
            ],
            "description": "Mental bandwidth exhaustion from decision volume. Always in reactive mode.",
            "symptoms": [
                "Decision backlog keeps growing",
                "Mentally drained by end of day",
                "Constant interruptions prevent deep work"
            ]
        },
        
        "approval_bottleneck": {
            "name": "Approval Bottleneck",
            "triggers": [
                "Constantly - I'm the bottleneck",
                "Waiting on me to review",
                "Yes - and I hate it",
                "Yes - but I don't know how to fix it"
            ],
            "description": "Your approval speed caps team throughput. Work sits waiting for you.",
            "symptoms": [
                "Work stops waiting for your review",
                "You know you're the bottleneck",
                "Team can't move without your sign-off"
            ]
        },
        
        "capacity_constraint": {
            "name": "Time/Slot Constraint",
            "triggers": [
                "Completely full, turning people away",
                "Overbooked - running behind constantly",
                "Actual service delivery capacity",
                "Not enough hours in the day"
            ],
            "description": "Available hours cap revenue growth. Schedule is the limiting factor.",
            "symptoms": [
                "Fully booked but can't take more clients",
                "Running behind even when schedule is full",
                "Physical time is the constraint"
            ]
        },
        
        "exception_overhead": {
            "name": "Exception Overhead",
            "triggers": [
                "Over 50% - barely anything is standard anymore",
                "25-50%",
                "Constantly breaking down",
                "They work until they don't"
            ],
            "description": "Edge cases consume disproportionate time. Standard process breaking under load.",
            "symptoms": [
                "Most work is 'exceptions' now",
                "Systems fail unpredictably",
                "Exception handling prevents scaling"
            ]
        },
        
        "exception_handler": {
            "name": "Exception Handler",
            "triggers": [
                "Constantly - I'm the exception handler",
                "Daily",
                "Almost all my time - team handles standard, I handle chaos"
            ],
            "description": "You are the fallback for every edge case. Team escalates all special situations.",
            "symptoms": [
                "Team escalates constantly",
                "Your time spent on exceptions, not strategy",
                "Exception dependency blocks autonomy"
            ]
        },
        
        "identity_lock": {
            "name": "Identity Lock",
            "triggers": [
                "Goes to zero",
                "They hired me - won't accept substitutes",
                "I AM the work - can't separate",
                "Drops significantly"
            ],
            "description": "Business cannot run without your personal delivery. Revenue tied to your presence.",
            "symptoms": [
                "Revenue stops when you stop working",
                "Clients expect you specifically",
                "Identity merged with service delivery"
            ]
        },
        
        "expertise_bottleneck": {
            "name": "Expertise Bottleneck",
            "triggers": [
                "Quality won't match my standard",
                "I'll lose the expertise edge",
                "No - my expertise is unique"
            ],
            "description": "Expertise not externalized into trainable system. Knowledge trapped in founder.",
            "symptoms": [
                "Can't delegate due to quality fears",
                "Expertise feels irreplaceable",
                "Team capability limited by your knowledge"
            ]
        },
        
        "knowledge_transfer_gap": {
            "name": "Knowledge Transfer Gap",
            "triggers": [
                "No - it's in my head and changes every time",
                "They could watch but it's all feel/intuition"
            ],
            "description": "Process exists only in founder's head. No documented way to transfer knowledge.",
            "symptoms": [
                "Process is intuition-based",
                "Can't be replicated by watching",
                "Changes every time you do it"
            ]
        },
        
        "constraint_collision": {
            "name": "Constraint Collision",
            "triggers": [
                "Both equally - that's the problem",
                "Always - it's whack-a-mole",
                "Don't even have modes anymore - just chaos",
                "Constantly switching"
            ],
            "description": "Multiple active constraints. Fixing one exposes another. Context switching overhead.",
            "symptoms": [
                "Can't tell which constraint is primary",
                "Constant mode switching",
                "Solving one problem reveals another"
            ]
        },
        
        "golden_handcuffs": {
            "name": "Golden Handcuffs (Production Trap)",
            "triggers": [
                "Doing the actual service/work myself (instead of managing)",
                "New sales/bookings stop completely",
                "Owner (still doing the service/work myself)"
            ],
            "description": "You're the highest-paid producer. Can't step back to manage because revenue depends on your output.",
            "symptoms": [
                "You're the top biller in your own firm",
                "Delegation means immediate revenue drop",
                "Trapped between 'maker' and 'manager' modes"
            ]
        }
    }
    
    # Diagnostic questions for each pattern
    DIAGNOSTIC_QUESTIONS = {
        "founder_single_point_of_failure": [
            "If you were unexpectedly unavailable for a week, what would happen to revenue?",
            "Can your team deliver the same quality when you're not present?",
            "What percentage of client relationships require your personal involvement?"
        ],
        
        "tribal_knowledge": [
            "If you were hospitalized for 2 weeks, what critical information would die with you?",
            "How many times per day does someone interrupt you with a question they've asked before?",
            "What's the longest a new team member has taken to become fully productive?"
        ],
        
        "documentation_bypassed": [
            "When was the last time someone referenced your documentation without you reminding them?",
            "What format do team members actually use to learn (watching you, asking questions, trial and error)?",
            "If you reformatted your docs to match how your team actually learns, what would change?"
        ],
        
        "documentation_fragmentation": [
            "How many places does your team have to check to find a complete answer?",
            "What percentage of questions could be answered if docs were consolidated and searchable?",
            "What's preventing you from centralizing documentation right now?"
        ],
        
        "documentation_culture_gap": [
            "What happens when you ask 'did you check the docs?' (honest answer)",
            "What would make your team's first instinct be to check docs instead of asking you?",
            "Is this a training issue, a trust issue, or a habit issue?"
        ],
        
        "decision_overload": [
            "How many decisions do you make in a typical day?",
            "What percentage of those decisions could someone else make with proper context?",
            "What's the smallest decision you made today that you shouldn't have to make?"
        ],
        
        "approval_bottleneck": [
            "How many rounds of revision does the average project go through before you approve it?",
            "What percentage of work gets sent back with corrections vs. approved on first submission?",
            "Could your team describe what 'great work' looks like without asking you?"
        ],
        
        "capacity_constraint": [
            "What happens when you try to take on one more client?",
            "If you added 10 hours to the week, would that solve the problem?",
            "Is the constraint your time, or the team's capacity?"
        ],
        
        "exception_overhead": [
            "What percentage of projects actually follow your 'standard' process?",
            "How much time do exceptions consume vs. standard work?",
            "Are exceptions becoming the new normal?"
        ],
        
        "exception_handler": [
            "How many times per day does your team escalate 'special cases' to you?",
            "What would happen if you were unavailable when an exception occurred?",
            "Could someone else handle 80% of the exceptions with training?"
        ],
        
        "identity_lock": [
            "If you stopped doing client work for a month, what would happen to revenue?",
            "Do clients hire your company or do they hire you?",
            "What scares you most about stepping back from delivery?"
        ],
        
        "expertise_bottleneck": [
            "What parts of your expertise could be documented vs. taught?",
            "Has anyone on your team gotten to 70% of your capability?",
            "What would it take to make someone on your team 80% as good as you?"
        ],
        
        "knowledge_transfer_gap": [
            "If someone shadowed you for a month, could they replicate your process?",
            "How much of your work is 'feel' vs. 'system'?",
            "What would a documented version of your expertise look like?"
        ],
        
        "constraint_collision": [
            "When you fix one bottleneck, does another immediately appear?",
            "How many times per day do you switch between different types of work?",
            "Which constraint would you fix first if you could only fix one?"
        ],
        
        "golden_handcuffs": [
            "What percentage of total revenue comes from your personal billable work vs. the team's?",
            "If you spent 20 hours this week on business development instead of delivery, what would happen?",
            "What's your effective hourly rate when 'doing the work' vs. 'running the business'?"
        ]
    }
    
    def __init__(self, responses):
        """
        Initialize with questionnaire responses
        
        Args:
            responses (dict): Dictionary containing all questionnaire answers
        """
        self.responses = responses
        
        # Business type routing
        self.business_type = responses.get('business_type', '')
        
        # Hourly rate
        self.hourly_rate_answer = responses.get('hourly_rate', '')
        
        # Documentation state
        self.doc_state = responses.get('doc_state', '')
        self.doc_usage = responses.get('doc_usage', '')
        
        # Track B specific fields
        self.capacity_utilization = responses.get('capacity_utilization', '')
        self.growth_blocker = responses.get('growth_blocker', '')
        self.biggest_frustration = responses.get('biggest_frustration', '')
        self.current_revenue_estimate = responses.get('current_revenue_estimate', '')
        
        # Legacy fields (may still be present in some responses)
        self.revenue_band = responses.get('revenue', '$1M - $2M')
        self.team_size = responses.get('team_size', '2-5 people')
        self.role = responses.get('role', 'Owner')
        
        # Response patterns
        self.pile_up_locations = responses.get('pile_up', [])
        self.time_wasters = responses.get('time_wasters', [])
        self.time_theft = responses.get('time_theft', [])
        self.bus_factor = responses.get('bus_factor', '')
        self.work_hours = responses.get('work_hours', '50-60 hours')
        self.trapped_scale = responses.get('trapped_scale', 5)
        self.vision = responses.get('vision', '')
        self.tracking_method = responses.get('tracking_method', [])
        self.learning_method = responses.get('learning_method', '')
        self.vent = responses.get('vent', '')
        
        # Business-type specific answers
        self.absence_impact = responses.get('absence_impact', '')
        self.team_utilization = responses.get('team_utilization', '')
        self.decision_backlog = responses.get('decision_backlog', '')
        self.mental_energy = responses.get('mental_energy', '')
        self.revenue_dependency = responses.get('revenue_dependency', '')
        self.delegation_fear = responses.get('delegation_fear', '')
        
    def _parse_hourly_rate(self):
        """Parse hourly rate from user response"""
        rate_answer = self.hourly_rate_answer
        
        if not rate_answer:
            return 150  # default fallback
        
        if 'Under $50' in rate_answer:
            return 40
        elif '$50-$100' in rate_answer:
            return 75
        elif '$100-$150' in rate_answer:
            return 125
        elif '$150-$250' in rate_answer:
            return 200
        elif '$250-$400' in rate_answer:
            return 325
        elif 'Over $400' in rate_answer:
            return 500
        
        return 150
    
    def _parse_revenue_to_number(self, revenue_str):
        """Parse revenue estimate to midpoint number"""
        if not revenue_str:
            return 160000
        
        if 'Under $100k' in revenue_str:
            return 75000
        elif '$100k - $250k' in revenue_str:
            return 175000
        elif '$250k - $500k' in revenue_str:
            return 375000
        elif '$500k - $1M' in revenue_str:
            return 750000
        elif '$1M - $2M' in revenue_str:
            return 1500000
        elif 'Over $2M' in revenue_str:
            return 2500000
        
        return 160000
    
    def _determine_track(self):
        """
        Determine Track A (cognitive/opportunity) vs Track B (operational)
        
        Returns:
            str: 'A' or 'B'
        """
        business_type = self.business_type
        
        if 'Time-bound' in business_type:
            return 'B'
        elif 'Standardized' in business_type:
            return 'B'
        elif 'Decision-heavy' in business_type:
            return 'A'
        elif 'founder-led' in business_type:
            return 'A'
        else:
            # Default to A for 'mix of both'
            return 'A'
    
    def identify_bottleneck(self):
        """
        Pattern matching to identify primary and secondary bottlenecks
        
        Returns:
            dict: Primary and secondary bottleneck patterns with scores
        """
        scores = {}
        
        for pattern_id, pattern in self.BOTTLENECK_PATTERNS.items():
            score = 0
            matched_triggers = []
            
            # Combine all possible response fields that might contain triggers
            all_responses = (
                self.pile_up_locations + 
                self.time_wasters + 
                list(self.time_theft) +
                self.tracking_method +
                [
                    self.bus_factor, 
                    self.learning_method, 
                    self.role, 
                    self.work_hours,
                    self.doc_state,
                    self.doc_usage,
                    self.absence_impact,
                    self.team_utilization,
                    self.decision_backlog,
                    self.mental_energy,
                    self.revenue_dependency,
                    self.delegation_fear,
                    self.capacity_utilization,
                    self.growth_blocker
                ]
            )
            
            # Filter out None or empty strings
            all_responses = [r for r in all_responses if r]

            # Check all triggers against responses (Fuzzy match)
            for trigger in pattern['triggers']:
                match = next((resp for resp in all_responses if trigger in resp or resp in trigger), None)
                
                if match:
                    score += 2
                    matched_triggers.append(trigger)

            # Weighted check for bus factor (high impact)
            if self.bus_factor:
                 for trigger in pattern['triggers']:
                     if trigger in self.bus_factor or self.bus_factor in trigger:
                         score += 3
            
            scores[pattern_id] = {
                'score': score,
                'pattern': pattern,
                'matched': matched_triggers
            }
        
        # Get highest scoring pattern
        primary = max(scores.items(), key=lambda x: x[1]['score'])
        
        # Get second highest for "secondary constraint"
        remaining = {k: v for k, v in scores.items() if k != primary[0]}
        secondary = max(remaining.items(), key=lambda x: x[1]['score']) if remaining else None
        
        return {
            'primary': primary[1]['pattern'],
            'primary_id': primary[0],
            'primary_score': primary[1]['score'],
            'secondary': secondary[1]['pattern'] if secondary and secondary[1]['score'] > 0 else None,
            'secondary_id': secondary[0] if secondary and secondary[1]['score'] > 0 else None
        }
    
    def calculate_waste(self):
        """
        Calculate wasted hours and annual cost
        Routes to Track A or Track B calculation
        
        Returns:
            dict: Waste metrics including hours and dollar costs
        """
        track = self._determine_track()
        hourly_rate = self._parse_hourly_rate()
        
        if track == 'B':
            return self._calculate_track_b_cost(hourly_rate)
        else:
            return self._calculate_track_a_cost(hourly_rate)
    
    def _calculate_track_a_cost(self, hourly_rate):
        """
        Track A: Opportunity cost calculation
        For decision-heavy, founder-led businesses
        """
        # Calculate wasted hours from time_wasters
        waste_hours_min = 0
        waste_hours_max = 0
        
        # Combine time_wasters and time_theft
        all_wasters = self.time_wasters + list(self.time_theft)
        
        for waster in all_wasters:
            # Fuzzy match to map keys
            matched_key = next((k for k in self.TIME_WASTE_MAP.keys() if k in waster or waster in k), None)
            
            if matched_key:
                min_hrs, max_hrs = self.TIME_WASTE_MAP[matched_key]
                waste_hours_min += min_hrs
                waste_hours_max += max_hrs
        
        # If they selected "being interrupted constantly", apply efficiency penalty
        is_interrupted = any("interrupted" in w.lower() for w in all_wasters) or \
                        any("switching" in w.lower() for w in all_wasters)
        
        if is_interrupted:
            total_hours = self._parse_work_hours()
            context_tax = total_hours * 0.20
            waste_hours_min += context_tax * 0.8
            waste_hours_max += context_tax * 1.2
        
        # Average the waste
        avg_waste = (waste_hours_min + waste_hours_max) / 2
        
        # Calculate annual cost (50 working weeks)
        annual_low = waste_hours_min * hourly_rate * 50
        annual_high = waste_hours_max * hourly_rate * 50
        
        return {
            'waste_hours_min': round(waste_hours_min, 1),
            'waste_hours_max': round(waste_hours_max, 1),
            'waste_hours_avg': round(avg_waste, 1),
            'hourly_rate': hourly_rate,
            'annual_cost_low': int(annual_low),
            'annual_cost_high': int(annual_high),
            'annual_cost_mid': int((annual_low + annual_high) / 2),
            'track': 'A',
            'cost_explanation': 'Opportunity cost - what you could earn doing strategic work instead of firefighting'
        }
    
    def _calculate_track_b_cost(self, hourly_rate):
        """
        Track B: Operational cost calculation
        For time-bound, standardized service businesses
        Infers turnover from signals, not direct questions
        """
        # 1. TURNOVER COST (INFERRED)
        estimated_employees_left = 0
        
        # Infer from growth_blocker
        if "Can't find/train good people" in self.growth_blocker:
            estimated_employees_left = 2
        
        # Infer from biggest_frustration
        frustration_lower = self.biggest_frustration.lower() if self.biggest_frustration else ''
        if any(word in frustration_lower for word in ['employee', 'turnover', 'quit', 'leaving', 'hiring']):
            estimated_employees_left = max(estimated_employees_left, 2)
        
        # Infer from time_theft
        if 'Managing team drama or performance' in self.time_theft:
            estimated_employees_left = max(estimated_employees_left, 1)
        
        avg_replacement_cost = 15000
        turnover_cost = estimated_employees_left * avg_replacement_cost
        
        # 2. TEAM IDLE COST
        team_size = int(''.join(filter(str.isdigit, self.team_size))) if self.team_size else 3
        team_idle_hours_per_week = 0
        
        # Infer demand problem vs operational problem
        is_demand_problem = (
            'Struggling to fill appointments' in self.capacity_utilization or
            'Not enough demand' in self.growth_blocker
        )
        
        if is_demand_problem:
            team_idle_hours_per_week = team_size * 10  # demand issue
        elif 'Comfortable - some open slots' in self.capacity_utilization:
            team_idle_hours_per_week = team_size * 4
        elif self.absence_impact in ['Everything stops', 'Appointments get rescheduled']:
            team_idle_hours_per_week = team_size * 3
        
        avg_team_rate = hourly_rate * 0.45
        team_idle_cost = team_idle_hours_per_week * avg_team_rate * 50
        
        # 3. REVENUE LEAKAGE
        revenue_leakage = 0
        
        if 'Scheduling and rebooking' in self.time_theft:
            avg_service_price = hourly_rate * 1.5
            revenue_leakage += 2 * avg_service_price * 50
        
        if 'Chasing payments/invoicing' in self.time_theft:
            estimated_revenue = self._parse_revenue_to_number(
                self.current_revenue_estimate or self.revenue_band
            )
            revenue_leakage += estimated_revenue * 0.03
        
        # 4. GROWTH BLOCKED
        growth_blocked = 0
        
        if self.growth_blocker in ["Can't find/train good people", "Don't have systems to scale"]:
            potential_hours_per_week = 30
            potential_revenue = potential_hours_per_week * hourly_rate * 50
            potential_profit = potential_revenue * 0.35
            growth_blocked = potential_profit
        
        if 'Already at capacity but not profitable enough' in self.growth_blocker:
            estimated_revenue = self._parse_revenue_to_number(
                self.current_revenue_estimate or self.revenue_band
            )
            growth_blocked = estimated_revenue * 0.10
        
        total_annual_cost = turnover_cost + team_idle_cost + revenue_leakage + growth_blocked
        
        # Calculate equivalent wasted hours for comparison
        founder_wasted_hours = round((turnover_cost + revenue_leakage) / (hourly_rate * 50)) if hourly_rate > 0 else 0
        
        return {
            'waste_hours_min': founder_wasted_hours,
            'waste_hours_max': founder_wasted_hours,
            'waste_hours_avg': founder_wasted_hours,
            'hourly_rate': hourly_rate,
            'annual_cost_low': int(total_annual_cost * 0.8),
            'annual_cost_high': int(total_annual_cost * 1.2),
            'annual_cost_mid': int(total_annual_cost),
            'track': 'B',
            'turnover_cost': turnover_cost,
            'team_idle_cost': int(team_idle_cost),
            'revenue_leakage': int(revenue_leakage),
            'growth_blocked': int(growth_blocked),
            'cost_explanation': f"Operational costs: Turnover (${int(turnover_cost/1000)}k estimated from retention signals), team idle (${int(team_idle_cost/1000)}k), revenue leakage (${int(revenue_leakage/1000)}k), growth blocked (${int(growth_blocked/1000)}k). NOT based on billable hours."
        }
    
    def _parse_work_hours(self):
        """Convert work_hours string to number"""
        if "Under 40" in self.work_hours:
            return 35
        elif "40-50" in self.work_hours:
            return 45
        elif "50-60" in self.work_hours:
            return 55
        elif "60+" in self.work_hours:
            return 65
        return 50
    
    def get_diagnostic_questions(self, bottleneck_id):
        """
        Get validation questions for the identified bottleneck
        
        Args:
            bottleneck_id (str): The bottleneck pattern identifier
            
        Returns:
            list: Three diagnostic questions
        """
        return self.DIAGNOSTIC_QUESTIONS.get(bottleneck_id, [
            "Where specifically does work pile up in your workflow?",
            "What percentage of your team's questions are things you've already answered?",
            "What would break first if you took an unplanned week off?"
        ])
    
    def _get_why_explanation(self, bottleneck_id):
        """Get the 'why this happens' explanation for each pattern"""
        
        explanations = {
            "founder_single_point_of_failure": """
            This happens when you haven't built systems that allow the business to operate without you. 
            Every revenue dollar is tied to your personal availability. The business hasn't transitioned 
            from founder-delivered to team-delivered, so your presence is the constraint.
            """,
            
            "tribal_knowledge": """
            This happens when the business scales faster than documentation. In the early days, you could 
            answer questions in real-time because the team was small. But as you added people, the 
            "interrupt volume" exceeded your capacity to answer. Now you're trapped in a loop: you're too 
            busy answering questions to document the answers, which generates more questions.
            """,
            
            "documentation_bypassed": """
            This happens when documentation format doesn't match how your team actually learns in the 
            moment of need. A yearly meeting packet is a 'push' model (you give them info once), but 
            your team needs a 'pull' model (searchable answers when they have questions). The format 
            mismatch means they ignore docs and ask you directly.
            """,
            
            "documentation_fragmentation": """
            This happens from organic growth without consolidation. Each system was added to solve a 
            point problem, but no one designed the information architecture. Now knowledge is scattered 
            across Google Drive, Notion, email threads, and your head. Finding answers takes longer than 
            asking you.
            """,
            
            "documentation_culture_gap": """
            This happens when you built the system but didn't build the habit. Documentation exists but 
            the team's muscle memory is still 'ask the founder.' They need training, accountability, and 
            time to rewire the pattern. This is a change management issue, not a technical one.
            """,
            
            "decision_overload": """
            This happens when you're playing too many roles simultaneously. Each decision requires a 
            different cognitive mode, and the volume exceeds your mental bandwidth. You're always in 
            'shallow mode'—putting out fires but never building systems that would prevent them.
            """,
            
            "approval_bottleneck": """
            This happens because you have high standards (good) but you haven't externalized those 
            standards into a system the team can follow (bad). Your 'quality bar' exists only in your head, 
            forcing you to personally inspect every deliverable.
            """,
            
            "capacity_constraint": """
            This happens when you've optimized everything except the fundamental constraint: available hours. 
            You can't manufacture more time, so scaling requires either higher prices or delegation. The 
            schedule is the ceiling.
            """,
            
            "exception_overhead": """
            This happens when your 'standard' process was designed for ideal cases, but reality is messy. 
            Edge cases accumulate until they become the majority. Your process can't adapt, so exceptions 
            escalate to you.
            """,
            
            "exception_handler": """
            This happens when you're the only one with context to make judgment calls. The team handles 
            routine work but escalates anything ambiguous. You become the exception processor, spending 
            all your time on edge cases instead of strategy.
            """,
            
            "identity_lock": """
            This happens when your personal brand IS the business. Clients hired you, not your company. 
            Separating yourself from delivery feels like breaking a promise. But staying locked in delivery 
            prevents the business from growing beyond your personal capacity.
            """,
            
            "expertise_bottleneck": """
            This happens when your expertise is tacit knowledge—learned through experience, hard to 
            articulate. You can do the work but can't teach it because you don't consciously know what 
            you know. Delegation feels risky because quality depends on judgment you can't transfer.
            """,
            
            "knowledge_transfer_gap": """
            This happens when your process is intuition-based rather than system-based. It changes every 
            time because you're responding to context, not following a protocol. Documentation can't capture 
            'feel,' so the knowledge stays locked in your head.
            """,
            
            "constraint_collision": """
            This happens in hybrid businesses where multiple constraint types interact. You fix capacity 
            and hit a decision bottleneck. You fix decisions and hit a systems problem. The constraints 
            are coupled, creating whack-a-mole dynamics. Requires systems thinking, not point fixes.
            """,
            
            "golden_handcuffs": """
            This happens when your personal production rate is so high that delegation feels like a 
            revenue loss. You're the best closer, designer, or practitioner. Stepping back means immediate 
            cash flow hit. Trapped in a Catch-22: can't afford to stop doing the work, but doing the work 
            prevents building the business that would free you.
            """
        }
        
        return explanations.get(bottleneck_id, 
            "This pattern emerges from the natural evolution of a founder-led business that hasn't formalized its operational structure.")
    
    def generate_report_data(self):
        """
        Compile all data needed for report generation
        
        Returns:
            dict: Complete dataset for PDF report
        """
        bottleneck = self.identify_bottleneck()
        waste = self.calculate_waste()
        questions = self.get_diagnostic_questions(bottleneck['primary_id'])
        
        return {
            'responses': self.responses,
            'bottleneck': bottleneck,
            'waste': waste,
            'questions': questions,
            'why_explanation': self._get_why_explanation(bottleneck['primary_id']),
            'metadata': {
                'business_type': self.business_type,
                'hourly_rate': self.hourly_rate_answer,
                'doc_state': self.doc_state,
                'doc_usage': self.doc_usage,
                'trapped_scale': self.trapped_scale,
                'work_hours': self.work_hours,
                'vision': self.vision,
                'vent': self.vent,
                'biggest_frustration': self.biggest_frustration,
                'tracking_method': self.tracking_method,
                'learning_method': self.learning_method
            }
        }
    
    def generate_pdf_report(self, client_name, client_email, output_filename):
        """
        Generate complete PDF report
        
        Args:
            client_name (str): Client's name
            client_email (str): Client's email
            output_filename (str): Output PDF filename
        """
        report_data = self.generate_report_data()
        generator = ReportGenerator(report_data, client_name, client_email)
        generator.generate(output_filename)
        print(f"✓ Report generated: {output_filename}")


# ============================================================================
# PART 2: PDF REPORT GENERATOR
# ============================================================================

class ReportGenerator:
    """
    Generates branded 3-page PDF diagnostic reports
    """
    
    def __init__(self, report_data, client_name, client_email):
        self.data = report_data
        self.client_name = client_name
        self.client_email = client_email
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
        
    def _setup_custom_styles(self):
        """Create custom paragraph styles"""
        
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1a1a1a'),
            spaceAfter=30,
            alignment=TA_LEFT,
            fontName='Helvetica-Bold'
        ))
        
        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor('#2c3e50'),
            spaceAfter=12,
            spaceBefore=20,
            fontName='Helvetica-Bold'
        ))
        
        self.styles.add(ParagraphStyle(
            name='BodyText',
            parent=self.styles['Normal'],
            fontSize=11,
            leading=16,
            textColor=colors.HexColor('#333333'),
            alignment=TA_JUSTIFY
        ))
        
        self.styles.add(ParagraphStyle(
            name='BulletPoint',
            parent=self.styles['Normal'],
            fontSize=10,
            leading=14,
            leftIndent=20,
            bulletIndent=10,
            textColor=colors.HexColor('#333333')
        ))
        
        self.styles.add(ParagraphStyle(
            name='Callout',
            parent=self.styles['Normal'],
            fontSize=12,
            leading=16,
            textColor=colors.HexColor('#c0392b'),
            fontName='Helvetica-Bold',
            alignment=TA_CENTER,
            spaceAfter=12
        ))
    
    def generate(self, filename):
        """Generate the PDF report"""
        
        doc = SimpleDocTemplate(
            filename,
            pagesize=letter,
            rightMargin=0.75*inch,
            leftMargin=0.75*inch,
            topMargin=0.75*inch,
            bottomMargin=0.75*inch
        )
        
        story = []
        
        # PAGE 1: Executive Summary
        story.extend(self._build_page_1())
        story.append(PageBreak())
        
        # PAGE 2: The Diagnosis
        story.extend(self._build_page_2())
        story.append(PageBreak())
        
        # PAGE 3: Validation Questions
        story.extend(self._build_page_3())
        
        doc.build(story)
    
    def _build_page_1(self):
        """Page 1: Cover + Executive Summary"""
        content = []
        
        # Header
        content.append(Paragraph(
            "Operational Health Check",
            self.styles['CustomTitle']
        ))
        
        content.append(Paragraph(
            f"Prepared for: <b>{self.client_name}</b><br/>" +
            f"Date: {datetime.now().strftime('%B %d, %Y')}",
            self.styles['BodyText']
        ))
        
        content.append(Spacer(1, 0.3*inch))
        
        # The Diagnosis Box
        diagnosis_text = f"<b>Your Primary Bottleneck:</b><br/>{self.data['bottleneck']['primary']['name']}"
        content.append(Paragraph(diagnosis_text, self.styles['Callout']))
        
        content.append(Spacer(1, 0.2*inch))
        
        # Description
        content.append(Paragraph(
            "<b>What This Means:</b>",
            self.styles['SectionHeader']
        ))
        
        content.append(Paragraph(
            self.data['bottleneck']['primary']['description'],
            self.styles['BodyText']
        ))
        
        content.append(Spacer(1, 0.15*inch))
        
        # Symptoms
        content.append(Paragraph(
            "<b>Symptoms You're Experiencing:</b>",
            self.styles['SectionHeader']
        ))
        
        for symptom in self.data['bottleneck']['primary']['symptoms']:
            content.append(Paragraph(
                f"• {symptom}",
                self.styles['BulletPoint']
            ))
            content.append(Spacer(1, 0.05*inch))
        
        content.append(Spacer(1, 0.2*inch))
        
        # The Cost
        content.append(Paragraph(
            "<b>What This Is Costing You:</b>",
            self.styles['SectionHeader']
        ))
        
        waste = self.data['waste']
        track = waste.get('track', 'A')
        
        if track == 'A':
            # Track A: Opportunity cost language
            cost_text = f"""
            Based on your intake data, this bottleneck is consuming approximately 
            <b>{waste['waste_hours_min']}-{waste['waste_hours_max']} hours per week</b> 
            of your time on low-value firefighting instead of high-value leadership.
            <br/><br/>
            At your effective rate of <b>${waste['hourly_rate']}/hour</b>, this represents:
            <br/><br/>
            <b>Conservative annual cost: ${waste['annual_cost_low']:,} - ${waste['annual_cost_high']:,}</b>
            <br/><br/>
            This is your <i>opportunity cost</i>—what you could be earning doing strategic work 
            (sales, business development, building systems) instead of operational firefighting.
            """
        else:
            # Track B: Operational cost language
            cost_text = f"""
            Based on your intake data, this bottleneck is creating operational drag estimated at:
            <br/><br/>
            <b>Annual operational cost: ${waste['annual_cost_low']:,} - ${waste['annual_cost_high']:,}</b>
            <br/><br/>
            This breaks down as:<br/>
            • Employee turnover: ${waste.get('turnover_cost', 0):,} (estimated from retention signals)<br/>
            • Team capacity wasted: ${waste.get('team_idle_cost', 0):,}<br/>
            • Revenue leakage: ${waste.get('revenue_leakage', 0):,}<br/>
            • Growth blocked: ${waste.get('growth_blocked', 0):,}
            <br/><br/>
            <i>Note: This is NOT calculated from your billable hours, since you can't scale by 
            working more appointments yourself. These are real operational costs.</i>
            """
        
        content.append(Paragraph(cost_text, self.styles['BodyText']))
        
        content.append(Spacer(1, 0.15*inch))
        
        # What's NOT included
        content.append(Paragraph(
            "<b>This estimate does NOT include:</b>",
            self.styles['SectionHeader']
        ))
        
        if track == 'A':
            hidden_costs = [
                "Team productivity losses from waiting on you",
                "Revenue lost from deals you couldn't pursue",
                "Client churn from quality inconsistency",
                "The health cost of working " + self.data['metadata']['work_hours'].lower()
            ]
        else:
            hidden_costs = [
                "Customer lifetime value lost to quality variance",
                "Market share lost to competitors while you can't scale",
                "Team morale cost of chaotic operations",
                "Your personal health cost from the stress"
            ]
        
        for cost in hidden_costs:
            content.append(Paragraph(
                f"• {cost}",
                self.styles['BulletPoint']
            ))
            content.append(Spacer(1, 0.05*inch))
        
        return content
    
    def _build_page_2(self):
        """Page 2: Deep Dive on the Pattern"""
        content = []
        
        content.append(Paragraph(
            "The Pattern in Detail",
            self.styles['CustomTitle']
        ))
        
        content.append(Spacer(1, 0.2*inch))
        
        # How it manifests
        content.append(Paragraph(
            "<b>How This Shows Up in Your Day:</b>",
            self.styles['SectionHeader']
        ))
        
        # Use their actual responses
        manifestations = []
        
        if self.data['metadata'].get('vent'):
            manifestations.append(f"Your words: \"{self.data['metadata']['vent']}\"")
        
        if self.data['metadata'].get('biggest_frustration'):
            manifestations.append(f"Biggest frustration: \"{self.data['metadata']['biggest_frustration']}\"")
        
        manifestations.append(f"You're working {self.data['metadata']['work_hours'].lower()}")
        manifestations.append(f"You rated your 'trapped' feeling as {self.data['metadata']['trapped_scale']}/10")
        
        if self.data['metadata']['hourly_rate']:
            manifestations.append(f"Your effective hourly rate: {self.data['metadata']['hourly_rate']}")
        
        if self.data['metadata']['doc_state']:
            manifestations.append(f"Documentation state: {self.data['metadata']['doc_state']}")
        
        if self.data['metadata'].get('doc_usage'):
            manifestations.append(f"Team documentation usage: {self.data['metadata']['doc_usage']}")
        
        for item in manifestations:
            content.append(Paragraph(
                f"• {item}",
                self.styles['BulletPoint']
            ))
            content.append(Spacer(1, 0.05*inch))
        
        content.append(Spacer(1, 0.2*inch))
        
        # Why it happens
        content.append(Paragraph(
            "<b>Why This Happens:</b>",
            self.styles['SectionHeader']
        ))
        
        content.append(Paragraph(
            self.data['why_explanation'],
            self.styles['BodyText']
        ))
        
        content.append(Spacer(1, 0.2*inch))
        
        # Secondary constraint (if exists)
        if self.data['bottleneck']['secondary']:
            content.append(Paragraph(
                "<b>Secondary Constraint Detected:</b>",
                self.styles['SectionHeader']
            ))
            
            content.append(Paragraph(
                f"<b>{self.data['bottleneck']['secondary']['name']}</b><br/>" +
                self.data['bottleneck']['secondary']['description'],
                self.styles['BodyText']
            ))
            
            content.append(Spacer(1, 0.15*inch))
            
            content.append(Paragraph(
                "<i>Note: Fixing the primary bottleneck will likely expose this secondary constraint. " +
                "This is normal—constraints are like Russian nesting dolls.</i>",
                self.styles['BodyText']
            ))
        
        content.append(Spacer(1, 0.2*inch))
        
        # What you said you want
        if self.data['metadata'].get('vision'):
            content.append(Paragraph(
                "<b>Your Vision (If This Was Fixed):</b>",
                self.styles['SectionHeader']
            ))
            
            content.append(Paragraph(
                f"\"{self.data['metadata']['vision']}\"",
                self.styles['BodyText']
            ))
            
            content.append(Spacer(1, 0.15*inch))
            
            content.append(Paragraph(
                "This is achievable. But it requires changing the <i>structure</i> of how work flows, " +
                "not just working harder within the current broken system.",
                self.styles['BodyText']
            ))
        
        return content
    
    def _build_page_3(self):
        """Page 3: Validation Questions + Next Steps"""
        content = []
        
        content.append(Paragraph(
            "Validation & Next Steps",
            self.styles['CustomTitle']
        ))
        
        content.append(Spacer(1, 0.2*inch))
        
        # Diagnostic questions
        content.append(Paragraph(
            "<b>3 Questions to Validate This Diagnosis:</b>",
            self.styles['SectionHeader']
        ))
        
        content.append(Paragraph(
            "Answer these honestly. If 2 out of 3 confirm the pattern, the diagnosis is solid.",
            self.styles['BodyText']
        ))
        
        content.append(Spacer(1, 0.15*inch))
        
        for i, question in enumerate(self.data['questions'], 1):
            content.append(Paragraph(
                f"<b>{i}.</b> {question}",
                self.styles['BulletPoint']
            ))
            content.append(Spacer(1, 0.1*inch))
        
        content.append(Spacer(1, 0.3*inch))
        
        # What happens next
        content.append(Paragraph(
            "<b>What Happens Next:</b>",
            self.styles['SectionHeader']
        ))
        
        next_steps = """
        This mini-report is a <b>signal</b>, not a solution. It's designed to show you 
        <i>what</i> is broken and <i>approximately</i> what it's costing you.
        <br/><br/>
        If this resonates and you want the full picture, the next step is the 
        <b>Full Operational Diagnostic</b>—a 14-day deep dive that:
        <br/><br/>
        • Analyzes your actual workflow data (communication, tools, calendars)<br/>
        • Interviews your team anonymously to find the hidden friction<br/>
        • Delivers a complete operational roadmap with prioritized fixes<br/>
        • Includes a 90-minute workshop where we implement the first quick win<br/>
        <br/>
        <b>Investment: $5,000-$7,500</b> depending on team size and complexity.<br/>
        <b>Typical ROI: 10-20x</b> in the first year from recovered capacity.
        """
        
        content.append(Paragraph(next_steps, self.styles['BodyText']))
        
        content.append(Spacer(1, 0.2*inch))
        
        # No pressure close
        content.append(Paragraph(
            "<b>No Obligation:</b>",
            self.styles['SectionHeader']
        ))
        
        content.append(Paragraph(
            "This report is yours to keep. If it's useful, great. If the timing isn't right, " +
            "no hard feelings. Reach out when you're ready to fix this for real.",
            self.styles['BodyText']
        ))
        
        content.append(Spacer(1, 0.2*inch))
        
        # Contact CTA
        content.append(Paragraph(
            "Questions? Ready for the full diagnostic?<br/>" +
            f"Email: {self.client_email}",
            self.styles['BodyText']
        ))
        
        return content


# ============================================================================
# PART 3: EXAMPLE USAGE & TESTING
# ============================================================================

if __name__ == "__main__":
    
    print("=" * 70)
    print("OPERATIONAL BOTTLENECK DIAGNOSTIC SYSTEM (UPDATED - TRACK A/B)")
    print("=" * 70)
    print()
    
    # Example 1: Time-Bound Service (Track B - Operational Cost)
    print("Example 1: Time-Bound Service - Track B Operational Cost")
    print("-" * 70)
    
    time_bound_responses = {
        'business_type': 'Time-bound service (appointments, shifts, on-site work)',
        'hourly_rate': '$100-$150/hour',
        'absence_impact': 'Everything stops',
        'capacity_utilization': 'Mostly booked',
        'growth_blocker': "Can't find/train good people",
        'doc_state': "It's all in my head",
        'current_revenue_estimate': '$100k - $250k',
        'time_theft': ['Managing team drama or performance', 'Scheduling and rebooking'],
        'biggest_frustration': 'Employees keep leaving and I have to start training all over again',
        'work_hours': '60+ hours',
        'trapped_scale': 9,
        'vision': 'I could take a week off without worrying the place would fall apart'
    }
    
    time_bound_diagnostic = BottleneckDiagnostic(time_bound_responses)
    time_bound_diagnostic.generate_pdf_report(
        client_name="Maria Rodriguez",
        client_email="maria@lavishdog.com",
        output_filename="report_track_b_example.pdf"
    )
    print()
    
    # Example 2: Decision-Heavy Service (Track A - Opportunity Cost)
    print("Example 2: Decision-Heavy Service - Track A Opportunity Cost")
    print("-" * 70)
    
    decision_heavy_responses = {
        'business_type': 'Decision-heavy service (projects, strategy, approvals)',
        'hourly_rate': '$250-$400/hour',
        'decision_backlog': '10+ things',
        'mental_energy': 'Fried - brain is mush',
        'doc_state': 'I have notes everywhere for reference',
        'doc_usage': 'Rarely - they ask me instead',
        'time_theft': ['Answering the same questions over and over', 'Fixing mistakes or redoing work'],
        'work_hours': '50-60 hours',
        'trapped_scale': 8,
        'vision': 'I could spend time selling instead of reviewing every deliverable',
        'biggest_frustration': 'My brain never stops - decisions all day every day'
    }
    
    decision_heavy_diagnostic = BottleneckDiagnostic(decision_heavy_responses)
    decision_heavy_diagnostic.generate_pdf_report(
        client_name="Sarah Kim",
        client_email="sarah@example.com",
        output_filename="report_track_a_example.pdf"
    )
    print()
    
    # Example 3: Founder-Led (Track A)
    print("Example 3: Founder-Led Expertise - Track A")
    print("-" * 70)
    
    founder_led_responses = {
        'business_type': 'Primarily founder-led expertise',
        'hourly_rate': 'Over $400/hour',
        'revenue_dependency': 'Goes to zero',
        'delegation_fear': "Quality won't match my standard",
        'doc_state': "No - it's in my head and changes every time",
        'time_theft': ['Doing the actual service/work myself'],
        'work_hours': '60+ hours',
        'trapped_scale': 10,
        'vision': 'The business runs without me needing to be in every client interaction',
        'biggest_frustration': 'Clients hired me, not my company - I AM the product'
    }
    
    founder_led_diagnostic = BottleneckDiagnostic(founder_led_responses)
    founder_led_diagnostic.generate_pdf_report(
        client_name="Dr. James Chen",
        client_email="james@example.com",
        output_filename="report_founder_track_a_example.pdf"
    )
    print()
    
    print("=" * 70)
    print("✓ All example reports generated successfully!")
    print("=" * 70)
    print()
    print("Track A examples: Decision-heavy, Founder-led (Opportunity cost)")
    print("Track B examples: Time-bound service (Operational cost)")
    print()
    print("Next steps:")
    print("1. Review the generated PDF reports")
    print("2. Compare Track A vs Track B cost calculations")
    print("3. Integrate with your TypeScript intake form")