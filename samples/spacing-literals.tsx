import styled from 'styled-components';

const spacing = {
  tiny: 4,
  small: 8,
  medium: 16,
  large: 24,
  xlarge: 32,
  xxlarge: 40
} as const;

const Box = styled.div``;

const Container = styled(Box)`
  margin: ${spacing.large};
`;
