import styled from 'styled-components';

const baseSpacing = 8;
const spacing = {
  tiny: baseSpacing / 2,
  small: baseSpacing,
  medium: baseSpacing * 2,
  large: baseSpacing * 3,
  xlarge: baseSpacing * 4,
  xxlarge: baseSpacing * 5
} as const;

const Box = styled.div``;

const Container = styled(Box)`
  margin: ${spacing.large};
`;
