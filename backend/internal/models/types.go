package models

// SearchArea represents the search area information
type SearchArea struct {
	Zip           string  `json:"zip"`
	Radius        int     `json:"radius"`
	DynamicRadius bool    `json:"dynamicRadius"`
	City          string  `json:"city"`
	State         string  `json:"state"`
	Latitude      float64 `json:"latitude"`
	Longitude     float64 `json:"longitude"`
	DynamicRadii  []int   `json:"dynamicRadii"`
}

// Dealer represents dealer information
type Dealer struct {
	CarfaxID                string  `json:"carfaxId"`
	DealerInventoryURL      string  `json:"dealerInventoryUrl"`
	CfxMicrositeURL         string  `json:"cfxMicrositeUrl"`
	Name                    string  `json:"name"`
	Address                 string  `json:"address"`
	City                    string  `json:"city"`
	State                   string  `json:"state"`
	Zip                     string  `json:"zip"`
	Phone                   string  `json:"phone"`
	Latitude                string  `json:"latitude"`
	Longitude               string  `json:"longitude"`
	DealerAverageRating     float64 `json:"dealerAverageRating"`
	DealerReviewComments    string  `json:"dealerReviewComments"`
	DealerReviewDate        string  `json:"dealerReviewDate"`
	DealerReviewReviewer    string  `json:"dealerReviewReviewer"`
	DealerReviewRating      int     `json:"dealerReviewRating"`
	DealerReviewCount       int     `json:"dealerReviewCount"`
	DdcValue                float64 `json:"ddcValue"`
	DealerBadgingExperience string  `json:"dealerBadgingExperience"`
}

// MonthlyPaymentEstimate represents monthly payment information
type MonthlyPaymentEstimate struct {
	Price              int     `json:"price"`
	DownPaymentPercent int     `json:"downPaymentPercent"`
	InterestRate       float64 `json:"interestRate"`
	TermInMonths       int     `json:"termInMonths"`
	LoanAmount         float64 `json:"loanAmount"`
	DownPaymentAmount  float64 `json:"downPaymentAmount"`
	MonthlyPayment     float64 `json:"monthlyPayment"`
}

// Images represents vehicle images
type Images struct {
	BaseURL    string     `json:"baseUrl"`
	Large      []string   `json:"large"`
	Medium     []string   `json:"medium"`
	Small      []string   `json:"small"`
	FirstPhoto FirstPhoto `json:"firstPhoto"`
}

// FirstPhoto represents the first photo in different sizes
type FirstPhoto struct {
	Large  string `json:"large"`
	Medium string `json:"medium"`
	Small  string `json:"small"`
}

// Listing represents a vehicle listing
type Listing struct {
	Dealer                  Dealer                 `json:"dealer"`
	ID                      string                 `json:"id"`
	VIN                     string                 `json:"vin"`
	Year                    int                    `json:"year"`
	Make                    string                 `json:"make"`
	Model                   string                 `json:"model"`
	Trim                    string                 `json:"trim"`
	SubTrim                 string                 `json:"subTrim"`
	TopOptions              []string               `json:"topOptions"`
	Mileage                 int                    `json:"mileage"`
	ListPrice               int                    `json:"listPrice"`
	CurrentPrice            int                    `json:"currentPrice"`
	MonthlyPaymentEstimate  MonthlyPaymentEstimate `json:"monthlyPaymentEstimate"`
	ExteriorColor           string                 `json:"exteriorColor"`
	InteriorColor           string                 `json:"interiorColor"`
	Engine                  string                 `json:"engine"`
	Displacement            string                 `json:"displacement"`
	Drivetype               string                 `json:"drivetype"`
	Transmission            string                 `json:"transmission"`
	Fuel                    string                 `json:"fuel"`
	MpgCity                 int                    `json:"mpgCity"`
	MpgHighway              int                    `json:"mpgHighway"`
	Bodytype                string                 `json:"bodytype"`
	VehicleCondition        string                 `json:"vehicleCondition"`
	CabType                 string                 `json:"cabType,omitempty"`
	BedLength               string                 `json:"bedLength,omitempty"`
	FollowCount             int                    `json:"followCount"`
	StockNumber             string                 `json:"stockNumber"`
	ImageCount              int                    `json:"imageCount"`
	Images                  Images                 `json:"images"`
	FirstSeen               string                 `json:"firstSeen"`
	DistanceToDealer        float64                `json:"distanceToDealer"`
	RecordType              string                 `json:"recordType"`
	DealerType              string                 `json:"dealerType"`
	Advantage               bool                   `json:"advantage"`
	VdpURL                  string                 `json:"vdpUrl"`
	SortScore               float64                `json:"sortScore"`
	BaseScore               float64                `json:"baseScore"`
	TpCostPerVdp            float64                `json:"tpCostPerVdp"`
	AtomOtherOptions        []string               `json:"atomOtherOptions,omitempty"`
	AtomTopOptions          []string               `json:"atomTopOptions,omitempty"`
	TpRetentionScore        float64                `json:"tpRetentionScore"`
	DealerBadgingExperience string                 `json:"dealerBadgingExperience"`
	Msrp                    int                    `json:"msrp,omitempty"`
	MpgCombined             int                    `json:"mpgCombined,omitempty"`
	AtomMake                string                 `json:"atomMake,omitempty"`
	AtomModel               string                 `json:"atomModel,omitempty"`
	AtomTrim                string                 `json:"atomTrim,omitempty"`
}

// CarfaxResponse represents the complete response from CARFAX API
type CarfaxResponse struct {
	SearchArea SearchArea `json:"searchArea"`
	Listings   []Listing  `json:"listings"`
}

// ErrorResponse represents an error response
type ErrorResponse struct {
	Error string `json:"error"`
}
