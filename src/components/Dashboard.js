import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardTitle,
  CardText,
  Button,
  Input,
  Form,
  FormGroup,
  CardImg,
  InputGroup,
  Spinner,
  CardBody,
} from "reactstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useNetwork,
} from "wagmi";
import {
  contractData,
  fromWeiToDecimals,
  toWeiToDecimals,
} from "../utils/web3-utils";
import { getQueryVariable } from "../utils/utils";
import { formatEther } from "viem";

export default function Dashboard() {
  const { address } = useAccount();

  const { data: balance, loading } = useContractRead({
    abi: contractData?.luminaiABI,
    address: contractData?.luminaiAddress,
    functionName: "balanceOf",
    args: [address],
    watch: true,
  });

  const { data: investorData } = useContractRead({
    abi: contractData?.luminaiStakingABI,
    address: contractData?.luminaiStakingAddress,
    functionName: "investors",
    args: [address],
    select: (data) => ({
      user: data[0],
      totalStaked: fromWeiToDecimals(data[1]?.toString() || 0, 6) / 1000000000000,
      totalClaimed: fromWeiToDecimals(data[2]?.toString() || 0, 6),
      startDate: Number(data[3]) * 1000,
      totalReferral: fromWeiToDecimals(data[5]?.toString()  / 1000000000000 || 0, 6),
      referrer: data[5]?.toString(),
    }),
    watch: true,
  });

  const { data: totalReward } = useContractRead({
    abi: contractData?.luminaiStakingABI,
    address: contractData?.luminaiStakingAddress,
    functionName: "calculateTotalReward",
    args: [address],
    watch: true,
  });

  const { data: airdropClaimFee } = useContractRead({
    abi: contractData?.luminaiAirdropABI,
    address: contractData?.luminaiAirdropAddress,
    functionName: "AIRDROP_CLAIM_FEE",
    args: [],
    watch: true,
  });

  const { data: airdropClaimed } = useContractRead({
    abi: contractData?.luminaiAirdropABI,
    address: contractData?.luminaiAirdropAddress,
    functionName: "airdropAmount",
    args: [address],
    watch: true,
    select: (data) => data?.toString(),
  });

  const { data: airdropAmountClaimed } = useContractRead({
    abi: contractData?.luminaiAirdropABI,
    address: contractData?.luminaiAirdropAddress,
    functionName: "airdropClaimedAmount",
    args: [address],
    watch: true,
    select: (data) => {
      const amountInEth = formatEther(data);
      return amountInEth;
    },
    onError(error) {
      console.log("Error", error);
    },
  });

  const { chain, chains } = useNetwork();

  const [stakeValue, setStakeValue] = useState(1);
  const [packageData, setPackageData] = useState({
    min: 1,
    apy: 90,
    days: 90,
  });
  const [activeCard, setActiveCard] = useState(1);

  const handlePackageClick = (min, apy, days) => {
    setPackageData({ min, apy, days });
    setStakeValue(min);
    setActiveCard(min);
  };

  // const handleStakeChange = (e) => {
  //   // const inputValue = parseFloat(e.target.value);
  //   // if (packageData && inputValue < packageData.min) {
  //   //   setStakeValue(packageData.min);
  //   // } else {
  //   //   setStakeValue(e.target.value);
  //   // }

  // };

  const { data: allowance, refetch: refetchAllowance } = useContractRead({
    abi: contractData?.luminaiABI,
    address: contractData?.luminaiAddress,
    functionName: "allowance",
    args: [address, contractData?.luminaiStakingAddress],
    watch: true,
  });

  const { writeAsync: approve, isLoading: isApproveLoading } = useContractWrite(
    {
      abi: contractData?.luminaiABI,
      address: contractData?.luminaiAddress,
      functionName: "approve",
      args: [
        contractData?.luminaiStakingAddress,
        toWeiToDecimals(stakeValue, 18),
      ],
      onError(error) {
        console.log("Error", error);
      },
    }
  );

  const { writeAsync: stakeAmount, isLoading: isStakeLoading } =
    useContractWrite({
      abi: contractData?.luminaiStakingABI,
      address: contractData?.luminaiStakingAddress,
      functionName: "stakeAmount",
      args: [
        toWeiToDecimals(stakeValue, 18),
        getQueryVariable("ref") || "0x0000000000000000000000000000000000000000",
      ],
      onError(error) {
        console.log("Error", error);
      },
    });

  const { writeAsync: claimReward, isLoading: isClaimRewardLoading } =
    useContractWrite({
      abi: contractData?.luminaiStakingABI,
      address: contractData?.luminaiStakingAddress,
      functionName: "claimTotalReward",
      args: [],
    });

  const { writeAsync: claimAirdrop, isLoading: isClaimAirdropLoading } =
    useContractWrite({
      abi: contractData?.luminaiAirdropABI,
      address: contractData?.luminaiAirdropAddress,
      functionName: "claimAirdrop",
      args: [
        getQueryVariable("ref") || "0x0000000000000000000000000000000000000000",
      ],
      value: airdropClaimFee?.toString(),
      onError(error) {
        console.log("Error", error);
      },
    });

  return (
    <Container id="dashboard"  className="container-fluid">
      <p className="main-head"></p>
      <Row className="row1">
        <Col xs="12" md="12" lg="5" className="mb-5 order-2 order-lg-1  column1">
          {/* <div className="scrollable-cards"> */}
          <Card body className="card1 mb-3  ">
            <Row >
              <Col xs="12">
                <CardTitle tag="h5">Staking Rewards</CardTitle>
              </Col>
              {/* <Col xs="4">
                  <Row>
                    <CardText>Total Rewards:</CardText>
                  </Row>
                  <Row>
                    <Col>
                      <CardText className="text-right red">452542</CardText>
                    </Col>
                    <Col>
                      <CardImg src={vector1} height="14px" />
                    </Col>
                  </Row>
                </Col> */}
            </Row>

            <Row>
              <Col>
                <CardImg />
              </Col>
            </Row>
            <CardText>
              <Row>
                <Col size="sm" color="light">
                  {fromWeiToDecimals(totalReward?.toString() || 0, 6)/ 1000000000000}
                </Col>
              </Row>
              <Row>
                <Col>
                  <Button
                    color="primary"
                    className="button"
                    block
                    disabled={isClaimRewardLoading}
                    onClick={() => claimReward()}
                  >
                    {isClaimRewardLoading && (
                      <Spinner size="sm" color="light" />
                    )}
                    Claim
                  </Button>
                </Col>
              </Row>
            </CardText>
          </Card>

          <Card body className="card2 mb-3">
            <Row>
              <Col xs="8">
              
              </Col>
            </Row>
            <Row>
              <Col>
                <CardImg />
              </Col>
            </Row>
            <CardText>
              <Row>
               
              </Row>
              <Row>
                <Col>
                
                </Col>
              </Row>
            </CardText>
          </Card>

          <Card body className="card4">
            <Row>
              <Col xs="8">
                <CardTitle tag="h5">Referral Rewards</CardTitle>
              </Col>
            </Row>
            <Row>
              <Col>
              <Col size="sm" color="light">{airdropClaimed || 0}</Col>
              </Col>
            </Row>
            <CardText>
              <Row>
                <Col size="sm" color="light">{airdropClaimed || 0}</Col>
              </Row>
            </CardText>
          </Card>

          {/* <Card body className="card2 mb-5">
              <Row>
                <Col xs="8">
                  <CardTitle tag="h5">You Stakes</CardTitle>
                </Col>
                <Col xs="4">
                  <Row>
                    <CardText>Stake Price:</CardText>
                  </Row>
                  <Row>
                    <Col>
                      <CardText className="text-right green">0.56%</CardText>
                    </Col>
                    <Col>
                      <CardImg src={vector2} height="14px" />
                    </Col>
                  </Row>{" "}
                </Col>
              </Row>
              <Row>
                <Col>
                  <CardImg />
                </Col>
              </Row>
              <CardText>
                <Row>
                  <Col className="cardHead">0.00</Col>
                </Row>
                <Row>
                  <Col xs="8" className="gray">
                    12% apy locked for 365 days And after 365 days 112% apy
                  </Col>
                  <Col xs="4">
                    <Button color="secondary">Withdraw</Button>
                  </Col>
                </Row>
              </CardText>
            </Card>

            <Card body className="card1 mb-5">
              <Row>
                <Col xs="8">
                  <CardTitle tag="h5">Rewards</CardTitle>
                </Col>
                <Col xs="4">
                  <Row>
                    <CardText>Total Rewards:</CardText>
                  </Row>
                  <Row>
                    <Col>
                      <CardText className="text-right red">452542</CardText>
                    </Col>
                    <Col>
                      <CardImg src={vector1} height="14px" />
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row>
                <Col>
                  <CardImg />
                </Col>
              </Row>
              <CardText>
                <Row>
                  <Col className="cardHead">0.00</Col>
                </Row>
                <Row>
                  <Col xs="8" className="gray">
                    All your rewards will be shown here on this portal
                  </Col>
                  <Col xs="4">
                    <Button color="primary" className="button">
                      Claim All
                    </Button>
                  </Col>
                </Row>
              </CardText>
            </Card>

            <Card body className="card2 mb-5">
              <Row>
                <Col xs="8">
                  <CardTitle tag="h5">You Stakes</CardTitle>
                </Col>
                <Col xs="4">
                  <Row>
                    <CardText>Stake Price:</CardText>
                  </Row>
                  <Row>
                    <Col>
                      <CardText className="text-right green">0.56%</CardText>
                    </Col>
                    <Col>
                      <CardImg src={vector2} height="14px" />
                    </Col>
                  </Row>{" "}
                </Col>
              </Row>
              <Row>
                <Col>
                  <CardImg />
                </Col>
              </Row>
              <CardText>
                <Row>
                  <Col className="cardHead">0.00</Col>
                </Row>
                <Row>
                  <Col xs="8" className="gray">
                    12% apy locked for 365 days And after 365 days 112% apy
                  </Col>
                  <Col xs="4">
                    <Button color="secondary">Withdraw</Button>
                  </Col>
                </Row>
              </CardText>
            </Card> */}
          {/* </div> */}
        </Col>

        <Col xs="12" md="12" lg="7" className="mb-5 order-1 order-lg-2 second-container">
          <Card body className="card3 form ">
            {/* <Card> */}
            <Row className="mt-4  rowone">
              <Col md="4">
                <Card
                  onClick={() => handlePackageClick(10, 200, 360)}
                  className={`package-card card-btn mb-2 mt-2 h-75 text-center ${
                    activeCard === 10 ? "active" : ""
                  }`}
                >
                  <CardTitle>PLAN-A </CardTitle>
                  <CardBody>200%</CardBody>
                </Card>
                <Col className="green min-dep mb-2">minimum  10-1000 APADA</Col>
              </Col>
              <Col md="4">
                <Card
                  onClick={() => handlePackageClick(1001, 220, 360)}
                  className={`package-card mb-2 mt-2 h-75 text-center ${
                    activeCard === 1001 ? "active" : ""
                  }`}
                >
                  <CardTitle>PLAN-B</CardTitle>
                  <CardBody>220%</CardBody>
                </Card>
                <Col className="green min-dep mb-2">minimum  1001-10000 APADA</Col>
              </Col>
              <Col md="4">
                <Card
                  onClick={() => handlePackageClick(10001, 240, 360)}
                  className={`package-card mb-2 mt-2 h-75 text-center ${
                    activeCard === 10001 ? "active" : ""
                  }`}
                >
                  <CardTitle>PLAN-C</CardTitle>
                  <CardBody>240%</CardBody>
                </Card>
                <Col className="green min-dep">minimum  10001 APADA</Col>
              </Col>
            </Row>
            {/* </Card> */}
            <Form className="form">
              <FormGroup className="mt-5 ">
                <Row>
                  <Col xs="8">Enter Amount</Col>
                  <Col>
                    Balance:{" "}
                    {!loading ? fromWeiToDecimals(balance || 0, 6) / 1000000000000 : "0"}{" "}
                    <span className="spn"></span>
                  </Col>
                </Row>
              </FormGroup>
              <FormGroup className="mb-5">
                <Row>
                  <Col>
                    <InputGroup className="inputGroup">
                      <Input
                      
                        type="number"
                        placeholder={stakeValue}
                        value={stakeValue}
                        onChange={(e) => {
                          setStakeValue(e.target.value);
                          if (e?.target?.value <= 1000) {
                            setPackageData({ min: 10, apy: 200, days: 360 });
                            setActiveCard(10);
                          } else if (e?.target?.value <= 10000) {
                            setPackageData({ min: 101, apy: 220, days: 360 });
                            setActiveCard(1001);
                          } else {
                            setPackageData({ min: 10001, apy: 240, days: 360 });
                            setActiveCard(10001);
                          }
                        }}
                        //   (e) => {
                        //   setStakeValue(e.target.value);
                        //   const packageValue = getPackageData(e.target.value);
                        //   console.log(packageValue);
                        //   setPackageData(packageValue);
                        // }
                        // }
                        className="custom-input"
                      />
                      <span className="input-group-text"></span>
                    </InputGroup>
                    <Col xs="12" className="green">
                      {packageData?.apy}% apy for {packageData?.days} days
                    </Col>
                  </Col>
                </Row>
              </FormGroup>
              <Container className="text-center">
                <FormGroup>
                  <Row>
                    <Col>
                      Total Token Staked :
                      <span className="spn">
                        {" "}
                        {investorData?.totalStaked} 
                      </span>
                    </Col>
                  </Row>
                </FormGroup>
                <FormGroup className="mb-5">
                  <Row>
                    <Col>
                      <Button
                        color="primary"
                        className="button form-button approvebtn"
                        onClick={() => {
                          console.log(
                            allowance,
                            fromWeiToDecimals(allowance || 0, 6)
                          );
                          if (
                            fromWeiToDecimals(allowance || 0, 6) <
                            Number(stakeValue)
                          ) {
                            approve().then(() => refetchAllowance());
                          } else {
                            stakeAmount().then(() => setStakeValue(0));
                          }
                        }}
                        disabled={
                          stakeValue === "0" ||
                          stakeValue === "" ||
                          isStakeLoading ||
                          isApproveLoading ||
                          Number(stakeValue) >
                            Number(fromWeiToDecimals(balance || 0, 6)) ||
                          Number(stakeValue) < 1
                        }
                      >
                        {(isStakeLoading || isApproveLoading) && (
                          <Spinner size="sm" color="light" className="mr-2" />
                        )}
                        {fromWeiToDecimals(allowance || 0, 6) <
                        Number(stakeValue)
                          ? "Approve"
                          : "Stake"}
                      </Button>
                      <Button
                        className="button form-button my-3 refferalbtn"
                        disabled={!address}
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${window.location.origin}?ref=${address}`
                          );
                        }}
                      >
                        Copy Referral Link
                      </Button>
                      {address && (
                        <div>{`${window.location.origin}?ref=${address}`}</div>
                      )}
                    </Col>
                  </Row>
                </FormGroup>
              </Container>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
