/**
 *
 */
package ai.bell.shop.spi.data;

import lombok.Data;

/**
 * @author john
 *
 */
@Data
public class Product {

	private Long id;

	private String name;

	private Long price;

	private String avatar;

	private String brief;

}
