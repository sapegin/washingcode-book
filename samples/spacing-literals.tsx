import styled from 'styled-components';

const spacing = {
  tiny: 4,
  small: 8,
  medium: 16,
  large: 24,
  xlarge: 32,
  xxlarge: 40
} as const;

// --- 8< -- 8< ---

const Box = styled.div``;

export const Container = styled(Box)`
  margin: ${spacing.large};
`;
