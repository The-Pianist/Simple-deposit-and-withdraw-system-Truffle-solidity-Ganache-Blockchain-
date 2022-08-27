pragma solidity >=0.8.0 <0.9.0;
abstract contract Logger {

  uint public testNum;

  constructor() {
    testNum = 1000;
  }

  function emitLog() public pure virtual returns(bytes32);

  function test3() internal pure returns(uint) {
    return 100;
  }

  function test5() external pure returns(uint) {
    test3();
    return 10;
  }
}