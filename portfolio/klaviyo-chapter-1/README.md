# Chapter 1: Klaviyo AI Stack Audit

**Company:** Klaviyo  
**Date:** October 2026

Klaviyo positions itself as an autonomous B2C CRM. This audit looks at how AI appears inside Klaviyo's own marketing across four areas: customer-facing AI, acquisition AI, operational AI, and invisible AI.

> **Marketing AI maturity:** 71/100  
> **Evidence confidence:** 87%

---

## Framework

### Four layers

| Layer | Scope |
|---|---|
| **Customer-facing AI** | Recommendations, search ranking, dynamic content, chatbots |
| **Acquisition AI** | Automated bidding, lookalike audiences, creative testing |
| **Operational AI** | Routing, workflow support, service and marketing operations |
| **Invisible AI** | Forecasting, scoring, optimization, models customers do not see |

### Three-Line Test

1. **Rules or models**
2. **AI type:** classification/prediction, recommendation/ranking, or generation
3. **Passive or active**

---

## 4-Layer Map

### Customer-facing AI

| Feature | Evidence | Confidence | Rules / model | AI type | Passive / active |
|---|---|---|---|---|---|
| **Piper AI SDR** | Qualified identifies Klaviyo as a Piper customer. Klaviyo CMO Jamie Domenici says the system follows up on leads, routes them, and generated $2M in pipeline in its first year. | **Confirmed · 98%** | Model + workflow | Generation + classification | Passive |
| **PiperX personalization** | Domenici describes individualized website interactions and relevant content delivery rather than a uniform site experience. | **Confirmed · 90%** | Model + rules | Recommendation/ranking + generation | Passive |
| **Behavioral personalization architecture** | Klaviyo's MarTech & AI Solutions Architect role connects behavioral, product, and intent signals to personalization across the funnel. | **Inferred · 75%** | Hybrid | Recommendation/ranking + prediction | Active |

### Acquisition AI

| Feature | Evidence | Confidence | Rules / model | AI type | Passive / active |
|---|---|---|---|---|---|
| **B2B visitor intelligence** | My Klaviyo.com HAR capture loaded Dun & Bradstreet's `dnb_coretag_v6.min.js`, supporting anonymous visitor/account intelligence. | **Confirmed · 98%** | Model likely; exact method undisclosed | Classification/prediction | Passive |
| **Paid media optimization** | The HAR capture showed Google Ads and Floodlight measurement infrastructure. Automated bidding is plausible, but the browser capture cannot verify which optimization settings are enabled. | **Inferred · 70%** | Model if automated bidding is enabled | Recommendation/ranking | Passive |

### Operational AI

| Feature | Evidence | Confidence | Rules / model | AI type | Passive / active |
|---|---|---|---|---|---|
| **Lead and PQL scoring** | Klaviyo's Marketing Operations Lead role explicitly owns lead and PQL scoring models and routing logic. | **Confirmed · 95%** | Model or weighted rules | Classification/prediction if model-driven | Active |
| **Lifecycle automation** | The same role owns workflows, lifecycle automation, and event-based logic across inbound and product-led growth. | **Confirmed · 99%** | Rules | Automation | Active |
| **AI-assisted follow-up and localization** | Domenici describes automating repetitive work including lead follow-up and localization. | **Confirmed · 80%** | Model + workflow | Generation | Mixed |

### Invisible AI

| Feature | Evidence | Confidence | Rules / model | AI type | Passive / active |
|---|---|---|---|---|---|
| **Experimentation infrastructure** | The HAR capture directly loaded Optimizely experimentation code. The technology is confirmed; ML-driven optimization is not visible from the browser. | **Confirmed · 100%** | Statistical/rules unless model use is proven | Automation / experimentation | Passive |
| **Predictive scoring and intent automation** | Klaviyo's MarTech & AI Solutions Architect role explicitly references predictive scoring and intent-based automation. | **Inferred · 80%** | Model + rules | Classification/prediction | Active |
| **Performance feedback architecture** | The same role connects campaign execution, performance insights, planning, and ROI in a centralized marketing system. | **Inferred · 75%** | Hybrid | Classification/prediction | Active |

---

## Scoring

| Dimension | Weight |
|---|---:|
| Model sophistication | 25% |
| Proprietary data advantage | 25% |
| Autonomy | 20% |
| Learning loop | 15% |
| Business embeddedness | 15% |

| Layer | Score |
|---|---:|
| Customer-facing AI | **85/100** |
| Acquisition AI | **67/100** |
| Operational AI | **61/100** |
| Invisible AI | **67/100** |
| **Overall** | **71/100** |

---

## Assessment

### Strengths

Klaviyo's strongest evidence sits in customer-facing AI and marketing operations. Qualified's case study describes Piper handling inbound lead follow-up, routing, and personalized interactions, with $2M in pipeline generated during the first year. Klaviyo's Marketing Operations Lead role adds scoring, behavioral signals, lifecycle workflows, audience creation, and funnel experimentation. These capabilities are tied to conversion and pipeline, so the AI is operating inside important revenue processes. The strongest model-driven areas are conversational AI, personalization, and predictive scoring.

### Overstatement

Some capabilities are more accurately described as automation or experimentation. Lifecycle workflows and event-based logic can run on deterministic rules. Optimizely confirms experimentation infrastructure, although the browser evidence does not establish that machine learning selects the variants. Google Ads and Floodlight confirm acquisition measurement, while the exact bidding and optimization settings remain private. The same interface can sit on top of fixed rules or a learned model, so I classified each capability based on the evidence available.

### Ownership

The visible stack uses several external platforms, including Qualified/Piper, Dun & Bradstreet, Google advertising systems, and Optimizely. Klaviyo's differentiated capability appears deeper in the stack, where its own behavioral data, product signals, scoring logic, routing, and lifecycle workflows can be combined. Five of the eleven mapped capabilities are primarily passive. Four are active, one is mixed, and one is a rules-based internal workflow. The active layer is concentrated in the data and operating logic rather than the most visible AI interfaces.

### Opportunity

The largest opportunity is unified cross-variable decisioning. BrazeAI Decisioning Studio provides a useful benchmark because it applies reinforcement learning across variables such as message, offer, channel, timing, frequency, and creative. Klaviyo already has many of the inputs needed for a similar system: visitor intelligence, behavioral data, scoring, lifecycle automation, AI follow-up, and experimentation. I could not verify a single internal decision layer that optimizes these variables together across Klaviyo's own prospect journey. A shared decision layer would allow the existing systems to learn from one feedback loop rather than optimize individual steps separately.

### Limits

Several areas remain private: lead-scoring methodology, model refresh cadence, internal adoption of Klaviyo's own K:AI products, human approval thresholds, and incremental lift from AI-driven decisions. Third-party technology scanners also identified tools that did not appear in my browser capture, which could reflect consent rules, page-specific deployment, conditional loading, or older implementations. A stronger internal assessment would require the marketing systems architecture, model and rules inventory, experiment logs, holdout methodology, model performance metrics, adoption data, and ROI by workflow.

---

## Evidence

### Browser capture 1

![Initial Klaviyo network inspection](assets/klaviyo-network-before-reload.jpg)

*Initial Chrome DevTools inspection of Klaviyo.com.*

### Browser capture 2

![Klaviyo network capture after reload](assets/klaviyo-network-full-capture.jpg)

*Full network capture after reloading Klaviyo.com with DevTools open.*

### Source links

**Qualified / Klaviyo**  
Klaviyo CMO Jamie Domenici discusses Piper, lead routing, pipeline impact, and personalized web interactions.  
https://www.qualified.com/plus/articles/customer-reaction-with-klaviyo

**Klaviyo Marketing Operations Lead**  
Lead/PQL scoring, routing, behavioral signals, lifecycle automation, audience creation, and experimentation.  
https://www.klaviyo.com/careers/jobs/7617363003

**Klaviyo MarTech & AI Solutions Architect**  
Generative AI, predictive scoring, intent-based automation, personalization, and marketing performance architecture.  
https://www.klaviyo.com/careers/jobs/8003547003?gh_jid=8003547003

**BrazeAI Decisioning Studio**  
Competitor benchmark for reinforcement-learning decisioning across multiple marketing variables.  
https://www.braze.com/resources/articles/ai-decisioning-for-marketing

**Klaviyo Personalized Send Time**  
Product-side evidence of model-driven send-time optimization.  
https://help.klaviyo.com/hc/en-us/articles/45231714007323

### HAR findings

The October 6 browser capture recorded:

- Klaviyo onsite JavaScript
- HubSpot scripts and forms
- Optimizely experimentation code
- Dun & Bradstreet visitor-intelligence tagging
- Google Tag Manager and advertising measurement
- Capterra event tracking
- Navattic visitor/demo tracking
- Transcend consent-management infrastructure

These observations confirm deployed infrastructure. AI functionality is only classified as confirmed when the source also supports the model behavior.

---

## AI Use Notes

**Tools**  
ChatGPT, web research, Chrome DevTools, HAR export, GitHub.

**Prompt**  
> "Research Klaviyo comprehensively for a marketing AI stack analysis. I need to analyze the company in and out and assess how AI is being used across its marketing. Use the Stack Audit Template and map the company across Customer-facing AI, Acquisition AI, Operational AI, and Invisible AI. For every capability, include the feature or touchpoint, evidence, a confidence tag, rules or model, and passive or active. Include at least three pieces of evidence, a 400–700 word maturity assessment, and AI-use notes. Add confidence scores throughout the analysis and build a weighted maturity analysis so the final output shows both how mature each capability appears to be and how confident the evidence is."

**Iterations**  
9 major iterations.

**Override**  
I removed several claims that treated an installed technology as proof that its AI functionality was active. The HAR can confirm that a platform or tracker loaded, but it cannot reveal every model, configuration, or optimization setting behind it.

**AI strength**  
AI helped combine evidence from job postings, vendor material, product documentation, and the HAR into one consistent classification.

**AI error**  
An early version mixed Klaviyo's customer-facing AI products with the AI Klaviyo uses in its own marketing. I separated those because product capability does not establish internal adoption.
